import { MockTestSet } from '../types';
import { coordinateGeometryQuestions } from './coordinateGeometryQuestions';
import { mensurationQuestions } from './mensurationQuestions';

export const mockTestSets: MockTestSet[] = [
  {
    id: 'set_mensuration_23',
    title: 'BPSC TRE / STET: 2D & 3D Mensuration Real Papers',
    subtitle: 'Cuboid, Sphere, Cylinder, Cone, Rhombus, Circle with diagrams (23 Authentic Questions)',
    category: 'full_mock',
    categoryTitle: 'Mensuration & Geometry Special (23 Questions)',
    topicBadges: ['Mensuration', 'Cuboid & Cube', 'Sphere & Cylinder', 'Rhombus', 'Diagram-Based'],
    totalQuestions: mensurationQuestions.length,
    totalTimeMinutes: 30,
    questions: mensurationQuestions
  },
  {
    id: 'set_geometry_diagrams',
    title: 'BPSC TRE 4.0: Geometry & Coordinate Geometry with Diagrams',
    subtitle: 'Circle, Tangents, Triangle Medians & Trapezium Authentic CBT Problems',
    category: 'full_mock',
    categoryTitle: 'Geometry with Diagrams Mock (Real Papers)',
    topicBadges: ['Circle & Tangents', 'Median', 'Trapezium', 'Coordinates'],
    totalQuestions: coordinateGeometryQuestions.length,
    totalTimeMinutes: 15,
    questions: coordinateGeometryQuestions
  }
];
