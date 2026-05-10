import { Component, inject, OnInit, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NcertLearningService, VisualizationData } from '../../../core/api/ncert-learning.service';
import * as THREE from 'three';

export interface VisualizationConfig {
  concept: string;
  classLevel: number;
  subject: string;
  animationSpeed: number;
  autoRotate: boolean;
  showGrid: boolean;
  showAxes: boolean;
}

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule
  ],
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit, AfterViewInit, OnDestroy {
  private ncertService = inject(NcertLearningService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Three.js properties
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private mesh!: THREE.Mesh;

  // Component state
  isLoading = signal<boolean>(false);
  visualizationData = signal<VisualizationData | null>(null);
  error = signal<string>('');

  // Configuration
  config = signal<VisualizationConfig>({
    concept: '',
    classLevel: 9,
    subject: 'Mathematics',
    animationSpeed: 1,
    autoRotate: true,
    showGrid: true,
    showAxes: true
  });

  // Available options
  concepts = [
    'Pythagorean Theorem',
    'Atomic Structure',
    'Solar System',
    'DNA Structure',
    'Cell Division',
    'Photosynthesis',
    'Water Cycle',
    'Geometry Shapes',
    'Coordinate System',
    'Wave Motion'
  ];

  subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science'];
  classes = [9, 10, 11, 12];

  ngOnInit(): void {
    this.initializeFromQueryParams();
  }

  ngAfterViewInit(): void {
    this.initializeThreeJS();
  }

  ngOnDestroy(): void {
    this.cleanupThreeJS();
  }

  initializeFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['concept']) {
        this.config.update(config => ({
          ...config,
          concept: params['concept']
        }));
      }
      if (params['classLevel']) {
        this.config.update(config => ({
          ...config,
          classLevel: parseInt(params['classLevel']) || 9
        }));
      }
      if (params['subject']) {
        this.config.update(config => ({
          ...config,
          subject: params['subject'] || 'Mathematics'
        }));
      }
    });
  }

  initializeThreeJS(): void {
    const container = document.getElementById('visualization-container');
    if (!container) return;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Add grid and axes
    this.updateGridAndAxes();

    // Create initial visualization
    this.createDefaultVisualization();

    // Start animation loop
    this.animate();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createDefaultVisualization(): void {
    // Create a default geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x1976d2,
      wireframe: false
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  loadVisualization(): void {
    if (!this.config().concept) {
      this.snackBar.open('Please select a concept to visualize', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.ncertService.getVisualization(
      this.config().concept,
      this.config().classLevel,
      this.config().subject
    ).subscribe({
      next: (data) => {
        this.visualizationData.set(data);
        this.createVisualizationFromData(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading visualization:', error);
        this.error.set('Failed to load visualization. Using default visualization.');
        this.snackBar.open('Failed to load visualization, using default', 'Close', { duration: 3000 });
        this.createDefaultVisualization();
        this.isLoading.set(false);
      }
    });
  }

  createVisualizationFromData(data: VisualizationData): void {
    // Remove existing mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }

    try {
      // Parse visualization data
      const vizConfig = JSON.parse(data.content);
      
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;

      // Create geometry based on type
      switch (vizConfig.geometry) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(vizConfig.radius || 1, 32, 32);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(
            vizConfig.radiusTop || 1,
            vizConfig.radiusBottom || 1,
            vizConfig.height || 2,
            32
          );
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(vizConfig.radius || 1, vizConfig.height || 2, 32);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(
            vizConfig.radius || 1,
            vizConfig.tube || 0.4,
            16,
            100
          );
          break;
        case 'plane':
          geometry = new THREE.PlaneGeometry(
            vizConfig.width || 4,
            vizConfig.height || 4
          );
          break;
        default:
          geometry = new THREE.BoxGeometry(
            vizConfig.width || 2,
            vizConfig.height || 2,
            vizConfig.depth || 2
          );
      }

      // Create material
      material = new THREE.MeshPhongMaterial({
        color: vizConfig.color || 0x1976d2,
        wireframe: vizConfig.wireframe || false,
        transparent: vizConfig.transparent || false,
        opacity: vizConfig.opacity || 1
      });

      // Create mesh
      this.mesh = new THREE.Mesh(geometry, material);
      
      // Set position
      if (vizConfig.position) {
        this.mesh.position.set(
          vizConfig.position.x || 0,
          vizConfig.position.y || 0,
          vizConfig.position.z || 0
        );
      }

      // Set rotation
      if (vizConfig.rotation) {
        this.mesh.rotation.set(
          vizConfig.rotation.x || 0,
          vizConfig.rotation.y || 0,
          vizConfig.rotation.z || 0
        );
      }

      // Set scale
      if (vizConfig.scale) {
        this.mesh.scale.set(
          vizConfig.scale.x || 1,
          vizConfig.scale.y || 1,
          vizConfig.scale.z || 1
        );
      }

      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.scene.add(this.mesh);

    } catch (parseError) {
      console.error('Error parsing visualization data:', parseError);
      this.createDefaultVisualization();
    }
  }

  updateGridAndAxes(): void {
    // Remove existing grid and axes helpers
    const gridHelper = this.scene.getObjectByName('grid');
    const axesHelper = this.scene.getObjectByName('axes');
    
    if (gridHelper) this.scene.remove(gridHelper);
    if (axesHelper) this.scene.remove(axesHelper);

    // Add grid helper
    if (this.config().showGrid) {
      const grid = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
      grid.name = 'grid';
      this.scene.add(grid);
    }

    // Add axes helper
    if (this.config().showAxes) {
      const axes = new THREE.AxesHelper(5);
      axes.name = 'axes';
      this.scene.add(axes);
    }
  }

  animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.mesh && this.config().autoRotate) {
      this.mesh.rotation.x += 0.01 * this.config().animationSpeed;
      this.mesh.rotation.y += 0.01 * this.config().animationSpeed;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    const container = document.getElementById('visualization-container');
    if (!container) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  onConfigChange(): void {
    this.updateGridAndAxes();
  }

  resetCamera(): void {
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
  }

  toggleAnimation(): void {
    this.config.update(config => ({
      ...config,
      autoRotate: !config.autoRotate
    }));
  }

  goBack(): void {
    this.router.navigate(['/learn/book-browser']);
  }

  exportVisualization(): void {
    // Export current visualization as image
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `visualization-${this.config().concept}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    this.snackBar.open('Visualization exported successfully', 'Close', { duration: 3000 });
  }

  private cleanupThreeJS(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      const container = document.getElementById('visualization-container');
      if (container && this.renderer.domElement) {
        container.removeChild(this.renderer.domElement);
      }
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
