import TrendRush from './pages/TrendRush';
import LearningChallenges from './pages/LearningChallenges';
import CourseLesson from './pages/CourseLesson';
import { NovidadesAdmin } from './pages/admin/NovidadesAdmin';

// Importações diretas dos componentes da pasta pages
import FunnelFyComp from './pages/FunnelFy';
import FunnelFyEditorComp from './pages/FunnelFyEditor';

const routes = [
  {
    path: '/tools/trend-rush',
    element: <TrendRush />
  },
  {
    path: '/tools/funnelfy',
    element: <FunnelFyComp />
  },
  {
    path: '/tools/funnelfy/editor',
    element: <FunnelFyEditorComp />
  },
  {
    path: '/dashboard/tools/funnelfy',
    element: <FunnelFyComp />
  },
  {
    path: '/dashboard/tools/funnelfy/editor',
    element: <FunnelFyEditorComp />
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