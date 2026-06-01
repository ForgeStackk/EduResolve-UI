import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  inject, signal, computed, ViewChild, ElementRef, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import {
  ClassroomApiService,
  ClassroomInfo, SubjectRoom, ClassroomMessage, ClassroomMember, StudyGroup, GroupMember
} from '../../../core/api/classroom-api.service';
import { ClassroomWsService, ClassroomEvent } from './classroom-ws.service';
import { AuthService } from '../../../core/auth/auth.service';

type Panel = 'chat' | 'members' | 'pinned' | 'groups';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './classroom.component.html'
})
export class ClassroomComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageList') messageListEl?: ElementRef<HTMLDivElement>;

  private api        = inject(ClassroomApiService);
  private ws         = inject(ClassroomWsService);
  private auth       = inject(AuthService);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private wsSub?: Subscription;
  private shouldScrollToBottom = false;

  classroom      = signal<ClassroomInfo | null>(null);
  subjectRooms   = signal<SubjectRoom[]>([]);
  messages       = signal<ClassroomMessage[]>([]);
  members        = signal<ClassroomMember[]>([]);
  pinnedMessages = signal<ClassroomMessage[]>([]);

  activeSubjectRoomId = signal<number | null>(null);
  panel               = signal<Panel>('chat');
  loading             = signal(true);
  loadingMore         = signal(false);
  hasMore             = signal(true);
  composerText        = signal('');
  sending             = signal(false);
  error               = signal('');

  replyTo = signal<ClassroomMessage | null>(null);

  // ── Study groups state ────────────────────────────────────────────────────
  groups           = signal<StudyGroup[]>([]);
  groupsLoading    = signal(false);
  activeGroup      = signal<StudyGroup | null>(null);

  // Create/edit modal
  showGroupModal   = signal(false);
  groupModalMode   = signal<'create' | 'manage'>('create');
  groupName        = signal('');
  groupDescription = signal('');
  groupError       = signal('');
  groupSaving      = signal(false);
  memberSearch     = signal('');
  selectedIds      = signal<Set<number>>(new Set());
  showDeleteConfirm = signal(false);

  readonly filteredMembers = computed(() => {
    const q = this.memberSearch().toLowerCase();
    const myId = this.currentUserId();
    return this.members().filter(m =>
      m.userId !== myId && m.name.toLowerCase().includes(q)
    );
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '🙏', '🔥'];

  currentUserId = computed(() => {
    const u = this.auth.currentUser();
    return u ? Number(u.id) : 0;
  });

  activeRoomName = computed(() => {
    const id = this.activeSubjectRoomId();
    if (!id) return null;
    return this.subjectRooms().find(r => r.id === id)?.name ?? null;
  });

  ngOnInit(): void {
    this.loadClassroom();
  }

  private loadClassroom(): void {
    this.loading.set(true);
    this.api.getClassroom().subscribe({
      next: info => {
        this.classroom.set(info);
        this.loading.set(false);
        this.loadMessages(true);
        this.loadSubjectRooms(info.id);
        this.connectWs(info.id);
        this.sendPresence(info.id, true);
      },
      error: () => { this.loading.set(false); this.error.set('classroom.error.load'); }
    });
  }

  private loadSubjectRooms(classroomId: number): void {
    this.api.getSubjectRooms(classroomId).subscribe({
      next: rooms => this.subjectRooms.set(rooms),
      error: () => {}
    });
  }

  loadMessages(reset: boolean = false): void {
    const cr = this.classroom();
    if (!cr) return;

    if (reset) {
      this.messages.set([]);
      this.hasMore.set(true);
    }
    if (this.loadingMore()) return;

    const msgs = this.messages();
    const beforeId = reset ? undefined : (msgs.length > 0 ? msgs[0].id : undefined);

    this.loadingMore.set(true);
    this.api.getMessages(cr.id, {
      subjectRoomId: this.activeSubjectRoomId() ?? undefined,
      beforeId,
      limit: 30
    }).subscribe({
      next: batch => {
        // batch comes DESC, reverse to ASC for display
        const ordered = [...batch].reverse();
        if (reset) {
          this.messages.set(ordered);
          this.shouldScrollToBottom = true;
        } else {
          this.messages.update(prev => [...ordered, ...prev]);
          this.hasMore.set(batch.length === 30);
        }
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false)
    });
  }

  // ── Room switching ────────────────────────────────────────────────────────

  switchRoom(subjectRoomId: number | null): void {
    this.activeSubjectRoomId.set(subjectRoomId);
    this.panel.set('chat');
    this.replyTo.set(null);
    this.loadMessages(true);
  }

  // ── Sending ───────────────────────────────────────────────────────────────

  send(): void {
    const text = this.composerText().trim();
    if (!text || this.sending()) return;
    const cr = this.classroom();
    if (!cr) return;

    this.sending.set(true);
    const roomType = this.activeSubjectRoomId() ? 'SUBJECT' : 'GENERAL';
    const reply = this.replyTo();

    this.api.sendMessage(cr.id, {
      roomType,
      messageType: 'TEXT',
      textContent: text,
      replyToMessageId: reply?.id,
      subjectRoomId: this.activeSubjectRoomId() ?? undefined
    }).subscribe({
      next: msg => {
        this.messages.update(prev => [...prev, msg]);
        this.composerText.set('');
        this.replyTo.set(null);
        this.sending.set(false);
        this.shouldScrollToBottom = true;
      },
      error: () => this.sending.set(false)
    });
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  setReply(msg: ClassroomMessage): void {
    this.replyTo.set(msg);
  }

  cancelReply(): void {
    this.replyTo.set(null);
  }

  // ── Reactions ─────────────────────────────────────────────────────────────

  react(msg: ClassroomMessage, emoji: string): void {
    const cr = this.classroom();
    if (!cr) return;
    this.api.react(cr.id, msg.id, emoji, this.activeSubjectRoomId() ?? undefined).subscribe({
      next: () => { /* WS event will update reactions */ },
      error: () => {}
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteMessage(msg: ClassroomMessage): void {
    const cr = this.classroom();
    if (!cr) return;
    this.api.deleteMessage(cr.id, msg.id, this.activeSubjectRoomId() ?? undefined).subscribe({
      next: () => {
        this.messages.update(prev => prev.map(m =>
          m.id === msg.id ? { ...m, isDeleted: true, textContent: null } : m
        ));
      },
      error: () => {}
    });
  }

  // ── Pin ───────────────────────────────────────────────────────────────────

  pinMessage(msg: ClassroomMessage): void {
    const cr = this.classroom();
    if (!cr) return;
    const op = msg.isPinned
      ? this.api.unpinMessage(cr.id, msg.id, this.activeSubjectRoomId() ?? undefined)
      : this.api.pinMessage(cr.id, msg.id, this.activeSubjectRoomId() ?? undefined);
    op.subscribe({ next: () => this.loadMessages(true), error: () => {} });
  }

  // ── Panels ────────────────────────────────────────────────────────────────

  showMembers(): void {
    this.panel.set('members');
    if (this.members().length === 0) {
      const cr = this.classroom();
      if (cr) this.api.getMembers(cr.id).subscribe({ next: m => this.members.set(m), error: () => {} });
    }
  }

  showPinned(): void {
    this.panel.set('pinned');
    const cr = this.classroom();
    if (cr) {
      this.api.getPinned(cr.id, this.activeSubjectRoomId() ?? undefined)
        .subscribe({ next: p => this.pinnedMessages.set(p), error: () => {} });
    }
  }

  backToChat(): void {
    this.panel.set('chat');
  }

  openNoteDetail(noteId: number): void {
    this.router.navigate(['/student/notes', noteId]);
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }

  // ── Groups panel ──────────────────────────────────────────────────────────

  showGroups(): void {
    this.panel.set('groups');
    const cr = this.classroom();
    if (cr && this.groups().length === 0) this.loadGroups(cr.id);
    // Ensure member list is loaded for the create-group modal member picker
    if (this.members().length === 0 && cr) {
      this.api.getMembers(cr.id).subscribe({ next: m => this.members.set(m), error: () => {} });
    }
  }

  private loadGroups(classroomId: number): void {
    this.groupsLoading.set(true);
    this.api.listGroups(classroomId).subscribe({
      next: g => { this.groups.set(g); this.groupsLoading.set(false); },
      error: () => this.groupsLoading.set(false)
    });
  }

  openCreateGroup(): void {
    this.groupModalMode.set('create');
    this.groupName.set('');
    this.groupDescription.set('');
    this.selectedIds.set(new Set());
    this.memberSearch.set('');
    this.groupError.set('');
    this.activeGroup.set(null);
    this.showGroupModal.set(true);
  }

  openManageGroup(g: StudyGroup): void {
    this.activeGroup.set(g);
    this.groupModalMode.set('manage');
    this.groupName.set(g.name);
    this.groupDescription.set(g.description ?? '');
    this.groupError.set('');
    this.showDeleteConfirm.set(false);
    this.showGroupModal.set(true);
  }

  closeGroupModal(): void {
    this.showGroupModal.set(false);
    this.showDeleteConfirm.set(false);
    this.groupError.set('');
  }

  toggleMember(userId: number): void {
    this.selectedIds.update(s => {
      const next = new Set(s);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }

  submitCreateGroup(): void {
    const cr = this.classroom();
    if (!cr) return;
    const name = this.groupName().trim();
    if (!name) { this.groupError.set('Group name is required.'); return; }
    if (this.selectedIds().size === 0) { this.groupError.set('Select at least one classmate.'); return; }

    this.groupSaving.set(true);
    this.groupError.set('');
    this.api.createGroup(cr.id, {
      name,
      description: this.groupDescription().trim() || undefined,
      memberUserIds: [...this.selectedIds()]
    }).subscribe({
      next: g => {
        this.groups.update(gs => [g, ...gs]);
        this.groupSaving.set(false);
        this.closeGroupModal();
      },
      error: (e) => {
        this.groupError.set(e?.error?.message ?? 'Failed to create group. Try again.');
        this.groupSaving.set(false);
      }
    });
  }

  submitUpdateGroup(): void {
    const cr = this.classroom();
    const g  = this.activeGroup();
    if (!cr || !g) return;
    const name = this.groupName().trim();
    if (!name) { this.groupError.set('Group name is required.'); return; }

    this.groupSaving.set(true);
    this.api.updateGroup(cr.id, g.id, {
      name,
      description: this.groupDescription().trim() || undefined
    }).subscribe({
      next: updated => {
        this.groups.update(gs => gs.map(x => x.id === updated.id ? updated : x));
        this.groupSaving.set(false);
        this.closeGroupModal();
      },
      error: () => { this.groupError.set('Failed to update. Try again.'); this.groupSaving.set(false); }
    });
  }

  confirmDeleteGroup(): void { this.showDeleteConfirm.set(true); }

  executeDeleteGroup(): void {
    const cr = this.classroom();
    const g  = this.activeGroup();
    if (!cr || !g) return;
    this.groupSaving.set(true);
    this.api.deleteGroup(cr.id, g.id).subscribe({
      next: () => {
        this.groups.update(gs => gs.filter(x => x.id !== g.id));
        this.groupSaving.set(false);
        this.closeGroupModal();
      },
      error: () => { this.groupError.set('Failed to delete. Try again.'); this.groupSaving.set(false); }
    });
  }

  removeMemberFromGroup(g: StudyGroup, userId: number): void {
    const cr = this.classroom();
    if (!cr) return;
    this.api.removeGroupMember(cr.id, g.id, userId).subscribe({
      next: () => {
        const updated: StudyGroup = { ...g, members: g.members.filter(m => m.userId !== userId) };
        this.groups.update(gs => gs.map(x => x.id === g.id ? updated : x));
        if (this.activeGroup()?.id === g.id) this.activeGroup.set(updated);
      },
      error: () => {}
    });
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────

  private connectWs(classroomId: number): void {
    this.ws.connect(classroomId);
    this.ws.clearBadge();

    this.wsSub = this.ws.event$.subscribe((evt: ClassroomEvent) => {
      this.handleWsEvent(evt);
    });
  }

  private handleWsEvent(evt: ClassroomEvent): void {
    switch (evt.eventType) {
      case 'NEW_MESSAGE': {
        const msg: ClassroomMessage = evt.payload;
        const activeRoom = this.activeSubjectRoomId();
        // Only append if the message belongs to the currently displayed room
        if (!activeRoom && msg.roomType === 'GENERAL') {
          this.messages.update(prev => [...prev, msg]);
          this.shouldScrollToBottom = true;
        } else if (activeRoom && msg.roomId === activeRoom) {
          this.messages.update(prev => [...prev, msg]);
          this.shouldScrollToBottom = true;
        }
        break;
      }
      case 'MESSAGE_DELETED': {
        const id: number = evt.payload?.messageId;
        if (id) {
          this.messages.update(prev => prev.map(m =>
            m.id === id ? { ...m, isDeleted: true, textContent: null } : m
          ));
        }
        break;
      }
      case 'REACTION_UPDATED': {
        const { messageId, reactions } = evt.payload ?? {};
        if (messageId) {
          this.messages.update(prev => prev.map(m =>
            m.id === messageId ? { ...m, reactions } : m
          ));
        }
        break;
      }
      case 'MESSAGE_PINNED': {
        const id: number = evt.payload?.messageId;
        if (id) {
          this.messages.update(prev => prev.map(m =>
            m.id === id ? { ...m, isPinned: true } : m
          ));
        }
        break;
      }
    }
  }

  // ── Scroll ────────────────────────────────────────────────────────────────

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messageListEl && isPlatformBrowser(this.platformId)) {
      const el = this.messageListEl.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollToBottom = false;
    }
  }

  private sendPresence(classroomId: number, online: boolean): void {
    this.api.updatePresence(classroomId, online).subscribe({ error: () => {} });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  isOwn(msg: ClassroomMessage): boolean {
    return msg.senderId === this.currentUserId();
  }

  reactionTotal(msg: ClassroomMessage): number {
    return Object.values(msg.reactions ?? {}).reduce((a, b) => a + b, 0);
  }

  reactionEntries(msg: ClassroomMessage): [string, number][] {
    return Object.entries(msg.reactions ?? {}).filter(([, c]) => c > 0);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  isSameDay(a: ClassroomMessage, b: ClassroomMessage): boolean {
    return this.formatDate(a.createdAt) === this.formatDate(b.createdAt);
  }

  trackByMsgId(_: number, msg: ClassroomMessage): number {
    return msg.id;
  }

  ngOnDestroy(): void {
    const cr = this.classroom();
    if (cr) this.sendPresence(cr.id, false);
    this.ws.disconnect();
    this.wsSub?.unsubscribe();
  }
}
