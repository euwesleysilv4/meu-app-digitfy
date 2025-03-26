import TrendRush from './pages/TrendRush';
import LearningChallenges from './pages/LearningChallenges';
import CourseLesson from './pages/CourseLesson';
import { NovidadesAdmin } from './pages/admin/NovidadesAdmin';

const routes = [
  {
    path: '/tools/trend-rush',
    element: <TrendRush />
  },
  {
    path: '/learning/challenges',
    element: <LearningChallenges />
  },
  {
    path: '/learning/course',
    element: <CourseLesson />
  },
  {
    path: '/dashboard/admin/novidades',
    element: <NovidadesAdmin />
  }
]; 