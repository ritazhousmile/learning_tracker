import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onUpdateStatus: (taskId: number, status: string) => void;
  goalTitle?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onUpdateStatus, goalTitle }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'not_started':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <PlayIcon />;
      case 'not_started':
        return <PauseIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus?.toLowerCase()) {
      case 'not_started':
        return 'in_progress';
      case 'in_progress':
        return 'completed';
      case 'completed':
        return 'not_started';
      default:
        return 'in_progress';
    }
  };

  const getStatusAction = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'not_started':
        return 'Start';
      case 'in_progress':
        return 'Complete';
      case 'completed':
        return 'Restart';
      default:
        return 'Start';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking action buttons
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={getStatusIcon(task.status)}
              label={task.status.replace('_', ' ')}
              size="small"
              color={getStatusColor(task.status)}
            />
            {task.priority && (
              <Chip
                icon={<FlagIcon />}
                label={task.priority}
                size="small"
                color={getPriorityColor(task.priority)}
              />
            )}
            {isOverdue && (
              <Chip
                icon={<ScheduleIcon />}
                label="Overdue"
                size="small"
                color="error"
              />
            )}
          </Box>
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {goalTitle && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AssignmentIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Goal: {goalTitle}
              </Typography>
            </Box>
          )}
          {task.due_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Due: {formatDate(task.due_date)}
              </Typography>
            </Box>
          )}
          {task.estimated_hours && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Est: {task.estimated_hours}h
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          Created: {formatDate(task.created_at)}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }} onClick={handleActionClick}>
        <Box>
          <Button
            size="small"
            onClick={() => onEdit(task)}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(task.id)}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/tasks/${task.id}`)}
            startIcon={<VisibilityIcon />}
          >
            View Details
          </Button>
          <Tooltip title={getStatusAction(task.status)}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onUpdateStatus(task.id, getNextStatus(task.status))}
              startIcon={getStatusIcon(getNextStatus(task.status))}
            >
              {getStatusAction(task.status)}
            </Button>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default TaskCard; 