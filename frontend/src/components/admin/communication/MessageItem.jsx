import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { format } from 'date-fns';

const MessageItem = ({ message, onClick, onStar }) => {
  return (
    <ListItem 
      button 
      onClick={() => onClick(message)}
      sx={{
        bgcolor: message.read ? 'inherit' : 'action.hover',
        '&:hover': { bgcolor: 'action.selected' }
      }}
    >
      <ListItemAvatar>
        <Avatar src={message.sender.avatar}>
          {message.sender.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                {message.sender.name}
              </Typography>
              {message.role && (
                <Typography variant="caption" sx={{ bgcolor: 'primary.light', px: 1, borderRadius: 1 }}>
                  {message.role}
                </Typography>
              )}
            </Box>
            <Typography variant="caption">
              {format(new Date(message.date), 'MMM d, yyyy')}
            </Typography>
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color="textPrimary"
              sx={{ fontWeight: message.read ? 'normal' : 'bold' }}
            >
              {message.subject}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {message.preview}
            </Typography>
          </Box>
        }
      />
      <IconButton onClick={(e) => {
        e.stopPropagation();
        onStar(message);
      }}>
        {message.starred ? <Star color="warning" /> : <StarBorder />}
      </IconButton>
    </ListItem>
  );
};

export default MessageItem;
