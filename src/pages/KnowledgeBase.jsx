import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import {
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  Sparkles,
  ChevronRight,
  Filter,
  MapPin,
  Tag,
} from 'lucide-react';
import './KnowledgeBase.css';

export const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources', count: 48 },
    { id: 'faq', name: 'FAQs', count: 15, icon: HelpCircle },
    { id: 'guides', name: 'Guides', count: 18, icon: FileText },
    { id: 'academic', name: 'Academic', count: 12, icon: BookOpen },
    { id: 'personal', name: 'Personal Development', count: 8, icon: Sparkles },
  ];

  const resources = [
    {
      id: 1,
      title: 'How to Manage Your Study Time Effectively',
      category: 'guides',
      type: 'Guide',
      description: 'Learn proven strategies to organize your study schedule and maximize productivity.',
      views: 342,
      helpful: 94,
      tags: ['time-management', 'study-skills'],
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'What is the GPA Calculation Process?',
      category: 'faq',
      type: 'FAQ',
      description: 'Understanding how your GPA is calculated and what factors influence it.',
      views: 215,
      helpful: 87,
      tags: ['grading', 'academics'],
      readTime: '3 min read',
    },
    {
      id: 3,
      title: 'Test Anxiety: Coping Strategies',
      category: 'guides',
      type: 'Guide',
      description: 'Practical techniques to overcome test anxiety and perform your best during exams.',
      views: 428,
      helpful: 96,
      tags: ['mental-health', 'exam-prep'],
      readTime: '7 min read',
    },
    {
      id: 4,
      title: 'Understanding Academic Integrity',
      category: 'guides',
      type: 'Guide',
      description: 'Guide to academic honesty, proper citations, and avoiding plagiarism.',
      views: 189,
      helpful: 92,
      tags: ['ethics', 'writing'],
      readTime: '6 min read',
    },
    {
      id: 5,
      title: 'How Do I Request a Grade Recheck?',
      category: 'faq',
      type: 'FAQ',
      description: 'Step-by-step process for submitting a grade appeal or recheck request.',
      views: 156,
      helpful: 85,
      tags: ['grading', 'support'],
      readTime: '4 min read',
    },
    {
      id: 6,
      title: 'Building Healthy Study Habits',
      category: 'personal',
      type: 'Guide',
      description: 'Create sustainable study routines that improve learning and reduce burnout.',
      views: 367,
      helpful: 93,
      tags: ['wellness', 'study-skills'],
      readTime: '8 min read',
    },
  ];

  const faqs = [
    {
      question: 'Can I change my course after the deadline?',
      answer: 'Course changes after the deadline may be possible with instructor approval. Contact your academic advisor to discuss your situation.',
    },
    {
      question: 'How do I report an issue?',
      answer: 'Use the "Report New Issue" button on your dashboard. Select the appropriate category and provide detailed information about your concern.',
    },
    {
      question: 'What if I need urgent help?',
      answer: 'High-priority issues are marked as urgent. You can contact your teacher directly through the messaging system for immediate assistance.',
    },
  ];

  const filteredResources =
    selectedCategory === 'all'
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const searchedResources = filteredResources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Navigation />

        <div className="content-area">
          <div className="container">
            {/* Hero Section */}
            <section className="kb-hero">
              <div className="kb-hero-content">
                <h1>Knowledge Base</h1>
                <p>Find answers, guides, and resources to help you succeed.</p>
              </div>

              <div className="kb-search-box">
                <Search size={24} />
                <input
                  type="text"
                  placeholder="Search guides, FAQs, and resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Main Content */}
            <div className="kb-grid">
              {/* Sidebar - Categories */}
              <aside className="kb-sidebar">
                <div className="card">
                  <h3 className="mb-2 flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <Filter size={18} />
                    Categories
                  </h3>

                  <div className="category-list">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <div className="category-name">
                          {cat.icon && <cat.icon size={16} />}
                          <span>{cat.name}</span>
                        </div>
                        <span className="category-count">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="card mt-3">
                  <h3 className="mb-2">🏷️ Popular Tags</h3>
                  <div className="tags-cloud">
                    {['Study Skills', 'Mental Health', 'Academics', 'Time Management', 'Wellness', 'Career'].map((tag) => (
                      <button key={tag} className="tag-btn">
                        <Tag size={14} />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="kb-main">
                {/* Resources Section */}
                <section className="resources-section mb-4">
                  <div className="section-header flex-between mb-3">
                    <h2>
                      {selectedCategory === 'all' ? 'All Resources' : categories.find((c) => c.id === selectedCategory)?.name}
                    </h2>
                    <span className="result-count">
                      {searchedResources.length} results
                    </span>
                  </div>

                  {searchedResources.length > 0 ? (
                    <div className="resources-list">
                      {searchedResources.map((resource) => (
                        <article key={resource.id} className="resource-card card">
                          <div className="resource-header flex-between">
                            <div>
                              <h3 className="resource-title">{resource.title}</h3>
                              <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                                {resource.description}
                              </p>
                            </div>
                            <span className="resource-type">{resource.type}</span>
                          </div>

                          <div className="resource-tags">
                            {resource.tags.map((tag) => (
                              <span key={tag} className="tag-badge">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="resource-footer flex-between">
                            <div className="resource-meta">
                              <span>👁️ {resource.views} views</span>
                              <span>👍 {resource.helpful}% helpful</span>
                              <span>⏱️ {resource.readTime}</span>
                            </div>
                            <button className="btn btn-primary btn-small">
                              Read More <ChevronRight size={16} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state card text-center p-4">
                      <BookOpen size={48} style={{ margin: '0 auto 1rem', color: 'var(--neutral-400)' }} />
                      <h3>No resources found</h3>
                      <p className="text-muted">
                        Try adjusting your search or browse other categories.
                      </p>
                    </div>
                  )}
                </section>

                {/* FAQs Section */}
                <section className="faq-section">
                  <h2 className="mb-3">Frequently Asked Questions</h2>

                  <div className="faq-list">
                    {faqs.map((faq, idx) => (
                      <details key={idx} className="faq-item card">
                        <summary className="faq-question">
                          <HelpCircle size={18} />
                          <span>{faq.question}</span>
                        </summary>
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>

                {/* AI-Powered Search Hint */}
                <section className="ai-search-section card">
                  <div className="ai-search-content flex-between">
                    <div>
                      <h3 className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                        <Sparkles size={20} style={{ color: 'var(--primary-blue)' }} />
                        AI-Powered Search
                      </h3>
                      <p className="text-muted">
                        Can't find what you're looking for? Our AI assistant can help you find answers to your specific questions.
                      </p>
                    </div>
                    <button className="btn btn-primary">
                      Ask AI
                    </button>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
