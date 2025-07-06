import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Button,
  CardActionArea,
  Fab,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  TrackChanges,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DashboardData, TaskStatus } from '../../types';
import { dashboardService } from '../../services/api';
// import ProgressChart from './ProgressChart';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      setDashboardData(response.data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.IN_PROGRESS:
        return 'warning';
      case TaskStatus.NOT_STARTED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getTaskStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case TaskStatus.IN_PROGRESS:
        return <Schedule color="warning" />;
      case TaskStatus.NOT_STARTED:
        return <Assignment color="disabled" />;
      default:
        return <Assignment color="disabled" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        
        {/* Quick Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/goals')}
            color="primary"
          >
            New Goal
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks')}
          >
            New Task
          </Button>
        </Box>
      </Box>
      
      {/* Statistics Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 3
        }}
      >
        <Card sx={{ cursor: 'pointer' }}>
          <CardActionArea onClick={() => navigate('/goals')}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrackChanges color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Goals
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.stats.total_goals}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    Click to view all goals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
        
        <Card sx={{ cursor: 'pointer' }}>
          <CardActionArea onClick={() => navigate('/tasks')}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tasks
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.stats.total_tasks}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    Click to view all tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <CheckCircle color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4">
                  {dashboardData.stats.completed_tasks}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Warning color="error" sx={{ mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Overdue
                </Typography>
                <Typography variant="h4">
                  {dashboardData.stats.overdue_tasks}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3
        }}
      >
        {/* Recent Goals */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Goals
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/goals')}
              size="small"
            >
              View All
            </Button>
          </Box>
          {dashboardData.recent_goals.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="textSecondary" gutterBottom>
                No goals created yet. Start by creating your first learning goal!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/goals')}
                sx={{ mt: 2 }}
              >
                Create Your First Goal
              </Button>
            </Box>
          ) : (
            <List>
              {dashboardData.recent_goals.slice(0, 3).map((goal) => (
                <ListItem 
                  key={goal.id} 
                  divider
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => navigate('/goals')}
                >
                  <ListItemIcon>
                    <TrackChanges color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={goal.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Progress: {goal.progress_percentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={goal.progress_percentage}
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {goal.completed_tasks} of {goal.total_tasks} tasks completed
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Upcoming Tasks */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Upcoming Tasks
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/tasks')}
              size="small"
            >
              View All
            </Button>
          </Box>
          {dashboardData.upcoming_tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="textSecondary" gutterBottom>
                No upcoming tasks. Great job staying on top of your work!
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tasks')}
                sx={{ mt: 2 }}
              >
                Create Your First Task
              </Button>
            </Box>
          ) : (
            <List>
              {dashboardData.upcoming_tasks.slice(0, 4).map((task) => (
                <ListItem 
                  key={task.id} 
                  divider
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => navigate('/tasks')}
                >
                  <ListItemIcon>
                    {getTaskStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box>
                        <Chip
                          label={task.status.replace('_', ' ')}
                          color={getTaskStatusColor(task.status)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {task.due_date && (
                          <Typography variant="caption" color="textSecondary">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Progress Chart */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Progress Over Time
        </Typography>
        <Typography color="textSecondary">
          Progress charts will be available once you start creating goals and tasks.
        </Typography>
        {/* <ProgressChart /> */}
      </Paper>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Fab
          color="primary"
          onClick={() => navigate('/goals')}
          sx={{ mb: 1 }}
        >
          <TrackChanges />
        </Fab>
        <Fab
          color="secondary"
          onClick={() => navigate('/tasks')}
        >
          <Assignment />
        </Fab>
      </Box>
    </Container>
  );
};

export default Dashboard; 