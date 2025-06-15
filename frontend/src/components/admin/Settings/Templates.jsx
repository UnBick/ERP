import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Editor from '@monaco-editor/react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  TextFields,
  Square,
  Image,
  RotateRight,
  GridOn,
  GridOff,
  ZoomIn,
  ZoomOut,
  Straighten,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Layers,
  LockOutlined,
  LockOpenOutlined,
  Group as GroupIcon,
  Rotate90DegreesCcw,
  Height,
  BorderAll,
  ColorLens,
  FormatColorFill,
  Code,
  Save,
  FileCopy,
  RemoveRedEye,
  ImportExport,
  Settings,
  ToggleOn,
  CropOriginal,
  QrCode2,
  Pages,
  ViewComfy,
  SmartScreen,
  Visibility,
  AutoFixHigh,
  FolderShared,
  SaveAlt,
  CloudUpload,
  Undo,
  Redo,
  MoreVert,
  Code as CodeIcon,
  Visibility as PreviewIcon,
  ViewQuilt as VisualModeIcon,
  ViewColumn as SplitViewIcon,
  FileCopy as PagesIcon,
  Pageview as PagePreviewIcon,
  Add as AddPageIcon,
  Delete as RemovePageIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { getApiUrl, API_ENDPOINTS } from '../../../config/apiConfig';
import { v4 as uuidv4 } from 'uuid';
import { Rnd } from 'react-rnd';
import axios from 'axios';

const Templates = () => {
  const navigate = useNavigate();
  const [codeTab, setCodeTab] = useState(0); // 0 for HTML, 1 for CSS
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [lockedElements, setLockedElements] = useState({});
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isGridEnabled, setIsGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [guides, setGuides] = useState([]);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [rulers, setRulers] = useState({ show: false });
  const [selectedFormat, setSelectedFormat] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [codeMode, setCodeMode] = useState(false);
  const [exportFormat, setExportFormat] = useState('html');
  const [showPreview, setShowPreview] = useState(false);
  const [splitPaneSize, setSplitPaneSize] = useState('50%');
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cropMode, setCropMode] = useState(false);
  const [cropElement, setCropElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [shareDialog, setShareDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const canvasRef = React.useRef(null);
  const previewRef = useRef(null);

  const paperFormats = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
  };

  const elementTypes = {
    text: {
      icon: <TextFields />,
      label: 'Text',
      defaultContent: 'New Text',
      defaultStyle: {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: '1.5'
      }
    },
    shape: {
      icon: <Square />,
      label: 'Shape',
      defaultStyle: {
        backgroundColor: '#e0e0e0',
        borderRadius: '0px',
        width: '100px',
        height: '100px'
      }
    },
    image: {
      icon: <Image />,
      label: 'Image',
      defaultStyle: {
        objectFit: 'cover',
        width: '200px',
        height: '200px'
      }
    }
  };

  const saveToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(state));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = JSON.parse(history[historyIndex - 1]);
      setElements(previousState.elements);
      setCanvasSize(previousState.canvasSize);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = JSON.parse(history[historyIndex + 1]);
      setElements(nextState.elements);
      setCanvasSize(nextState.canvasSize);
    }
  };

  const saveProject = async () => {
    try {
      const projectData = {
        elements,
        canvasSize,
        zoomLevel,
        selectedFormat,
        orientation,
      };

      const response = await axios.post('/api/templates/save', projectData);
      setSavedTemplates([...savedTemplates, response.data]);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const loadProject = async (id) => {
    try {
      const response = await axios.get(`/api/templates/${id}`);
      const { elements, canvasSize, zoomLevel, selectedFormat, orientation } = response.data;
      setElements(elements);
      setCanvasSize(canvasSize);
      setZoomLevel(zoomLevel);
      setSelectedFormat(selectedFormat);
      setOrientation(orientation);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const generateShareLink = async () => {
    try {
      const response = await axios.post('/api/templates/share', {
        elements,
        canvasSize,
        selectedFormat
      });
      setShareLink(response.data.shareLink);
      setShareDialog(true);
    } catch (error) {
      console.error('Error generating share link:', error);
    }
  };

  const handleCreateElement = (type) => {
    // Check if type exists in elementTypes
    if (!elementTypes[type]) {
      console.error(`Invalid element type: ${type}`);
      return;
    }

    const element = {
      id: uuidv4(),
      type,
      content: type === 'text' ? elementTypes[type].defaultContent : '',
      position: { x: 50, y: 50 },
      size: { 
        width: parseInt(elementTypes[type].defaultStyle?.width) || 100,
        height: parseInt(elementTypes[type].defaultStyle?.height) || 100
      },
      style: elementTypes[type].defaultStyle || {}
    };
    setElements([...elements, element]);
    setSelectedElement(element);
  };

  const handleUpdateElement = (id, updates) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleZoomChange = (value) => {
    setZoomLevel(Math.min(Math.max(25, value), 400)); // Limit zoom between 25% and 400%
  };

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    const size = paperFormats[format];
    setCanvasSize({ width: size.width, height: size.height });
  };

  const handleOrientationChange = () => {
    setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'));
    const size = paperFormats[selectedFormat];
    setCanvasSize({
      width: orientation === 'portrait' ? size.height : size.width,
      height: orientation === 'portrait' ? size.width : size.height,
    });
  };

  const toggleFontStyle = (style) => {
    if (!selectedElement) return;
    
    const updates = {};
    switch (style) {
      case 'bold':
        updates.fontWeight = selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold';
        break;
      case 'italic':
        updates.fontStyle = selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic';
        break;
      case 'underline':
        updates.textDecoration = selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline';
        break;
    }
    
    handleElementStyle(selectedElement.id, Object.keys(updates)[0], Object.values(updates)[0]);
  };

  const handleSizeChange = (dimension, value) => {
    if (!selectedElement) return;
    const newSize = { ...selectedElement.size, [dimension]: parseInt(value) };
    handleUpdateElement(selectedElement.id, { size: newSize });
  };

  const handleLayerChange = (direction) => {
    if (!selectedElement) return;
    const elementIndex = elements.findIndex(el => el.id === selectedElement.id);
    const newElements = [...elements];
    const element = newElements.splice(elementIndex, 1)[0];
    
    if (direction === 'front') {
      newElements.push(element);
    } else {
      newElements.unshift(element);
    }
    
    setElements(newElements);
  };

  const calculateGuides = (draggingElement) => {
    const guides = { vertical: [], horizontal: [] };
    elements.forEach(element => {
      if (element.id !== draggingElement.id) {
        // Center alignment
        guides.vertical.push(element.position.x + element.size.width / 2);
        guides.horizontal.push(element.position.y + element.size.height / 2);
        // Edge alignment
        guides.vertical.push(element.position.x, element.position.x + element.size.width);
        guides.horizontal.push(element.position.y, element.position.y + element.size.height);
      }
    });
    return guides;
  };

  const suggestLayout = () => {
    // Implement layout suggestions based on template type
    const layouts = {
      idCard: [
        { type: 'image', x: 10, y: 10, width: 80, height: 100 },
        { type: 'text', x: 100, y: 10, width: 200, height: 30, content: '{Name}' },
        { type: 'text', x: 100, y: 50, width: 200, height: 30, content: '{ID}' }
      ]
      // Add more layout presets...
    };
    return layouts;
  };

  const addQRCode = () => {
    const newElement = {
      id: uuidv4(),
      type: 'qrcode',
      content: 'https://example.com',
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 }
    };
    setElements([...elements, newElement]);
  };

  const addPlaceholder = (field) => {
    const newElement = {
      id: uuidv4(),
      type: 'text',
      content: `{${field}}`,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 30 },
      style: elementTypes.text.defaultStyle
    };
    setElements([...elements, newElement]);
  };

  const addNewPage = () => {
    const newPage = { id: pages.length + 1, elements: [] };
    setPages([...pages, newPage]);
    setCurrentPage(newPage.id);
  };

  const toolbarGroups = {
    insert: {
      icon: <Add />,
      title: 'Insert',
      items: [
        { 
          id: 'text', 
          icon: <TextFields />, 
          label: 'Add Text', 
          action: () => handleCreateElement('text'),
          panel: (
            <Box sx={{ p: 2, minWidth: 250 }}>
              <Typography variant="subtitle2" gutterBottom>Text Options</Typography>
              <TextField
                fullWidth
                placeholder="Enter text"
                defaultValue="New Text"
                onChange={(e) => handleUpdateElement(selectedElement?.id, { content: e.target.value })}
              />
            </Box>
          )
        },
        { 
          id: 'image', 
          icon: <Image />, 
          label: 'Add Image', 
          action: () => handleCreateElement('image'),
          panel: (
            <Box sx={{ p: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpdateElement(selectedElement?.id, { content: e.target.files[0] })}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span">
                  Upload Image
                </Button>
              </label>
            </Box>
          )
        },
        { 
          id: 'shape', 
          icon: <Square />, 
          label: 'Add Shape',
          panel: (
            <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {['rectangle', 'circle', 'line'].map(shape => (
                <Button
                  key={shape}
                  variant="outlined"
                  onClick={() => handleCreateElement('shape', { shapeType: shape })}
                  sx={{ height: 60 }}
                >
                  {shape}
                </Button>
              ))}
            </Box>
          )
        }
      ]
    },
    style: {
      icon: <FormatColorFill />,
      title: 'Style',
      items: [
        {
          id: 'font',
          icon: <TextFields />,
          label: 'Font',
          panel: (
            <Box sx={{ p: 2, minWidth: 250 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={selectedElement?.style?.fontFamily || 'Arial'}
                  onChange={(e) => handleUpdateElement(selectedElement?.id, { style: { ...selectedElement.style, fontFamily: e.target.value } })}
                >
                  {['Arial', 'Times New Roman', 'Roboto', 'Open Sans'].map(font => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <IconButton onClick={() => toggleFontStyle('bold')}>
                  <FormatBold color={selectedElement?.style?.fontWeight === 'bold' ? 'primary' : 'inherit'} />
                </IconButton>
                <IconButton onClick={() => toggleFontStyle('italic')}>
                  <FormatItalic color={selectedElement?.style?.fontStyle === 'italic' ? 'primary' : 'inherit'} />
                </IconButton>
                <IconButton onClick={() => toggleFontStyle('underline')}>
                  <FormatUnderlined color={selectedElement?.style?.textDecoration === 'underline' ? 'primary' : 'inherit'} />
                </IconButton>
              </Box>
              <TextField
                type="number"
                label="Font Size"
                value={selectedElement?.style?.fontSize || 16}
                onChange={(e) => handleUpdateElement(selectedElement?.id, { style: { ...selectedElement.style, fontSize: `${e.target.value}px` } })}
                fullWidth
              />
            </Box>
          )
        },
        {
          id: 'fill',
          icon: <ColorLens />,
          label: 'Fill & Color',
          panel: (
            <Box sx={{ p: 2 }}>
              <TextField
                type="text"
                label="Background Color"
                value={selectedElement?.style?.backgroundColor || 'transparent'}
                onChange={(e) => handleUpdateElement(selectedElement?.id, { style: { ...selectedElement.style, backgroundColor: e.target.value } })}
                fullWidth
              />
            </Box>
          )
        },
        {
          id: 'border',
          icon: <BorderAll />,
          label: 'Border',
          panel: (
            <Box sx={{ p: 2 }}>
              <TextField
                type="number"
                label="Border Width"
                value={selectedElement?.style?.borderWidth || 0}
                onChange={(e) => handleUpdateElement(selectedElement?.id, { style: { ...selectedElement.style, borderWidth: `${e.target.value}px` } })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                type="number"
                label="Border Radius"
                value={selectedElement?.style?.borderRadius || 0}
                onChange={(e) => handleUpdateElement(selectedElement?.id, { style: { ...selectedElement.style, borderRadius: `${e.target.value}px` } })}
                fullWidth
              />
            </Box>
          )
        }
      ]
    },
    transform: {
      icon: <Rotate90DegreesCcw />,
      title: 'Transform',
      items: [
        {
          id: 'position',
          icon: <Height />,
          label: 'Size & Position',
          panel: (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    type="number"
                    label="Width"
                    value={selectedElement?.size?.width || 0}
                    onChange={(e) => handleSizeChange('width', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="number"
                    label="Height"
                    value={selectedElement?.size?.height || 0}
                    onChange={(e) => handleSizeChange('height', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          )
        },
        {
          id: 'layer',
          icon: <Layers />,
          label: 'Layer Controls',
          panel: (
            <Box sx={{ p: 2 }}>
              <Button onClick={() => handleLayerChange('front')}>Bring to Front</Button>
              <Button onClick={() => handleLayerChange('back')}>Send to Back</Button>
              <Button 
                onClick={() => setLockedElements(prev => ({ ...prev, [selectedElement?.id]: !prev[selectedElement?.id] }))}
                startIcon={lockedElements[selectedElement?.id] ? <LockOutlined /> : <LockOpenOutlined />}
              >
                {lockedElements[selectedElement?.id] ? 'Unlock' : 'Lock'}
              </Button>
            </Box>
          )
        }
      ]
    },
    layout: {
      icon: <SmartScreen />,
      title: 'Layout Tools',
      items: [
        {
          id: 'autoLayout',
          icon: <AutoFixHigh />,
          label: 'Auto Layout',
          action: () => suggestLayout(),
          panel: (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2">Suggested Layouts</Typography>
              {['ID Card', 'Certificate', 'Letter'].map(layout => (
                <Button
                  key={layout}
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => applyLayout(layout)}
                >
                  {layout}
                </Button>
              ))}
            </Box>
          )
        },
        {
          id: 'placeholders',
          icon: <ViewComfy />,
          label: 'Placeholders',
          panel: (
            <Box sx={{ p: 2 }}>
              {['Name', 'ID', 'School', 'Date'].map(field => (
                <Chip
                  key={field}
                  label={`{${field}}`}
                  onClick={() => addPlaceholder(field)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          )
        }
      ]
    },
    tools: {
      icon: <CropOriginal />,
      title: 'Tools',
      items: [
        {
          id: 'qrcode',
          icon: <QrCode2 />,
          label: 'Add QR Code',
          action: () => addQRCode()
        },
        {
          id: 'crop',
          icon: <CropOriginal />,
          label: 'Crop Tool',
          action: () => setCropMode(!cropMode)
        },
        {
          id: 'preview',
          icon: <Visibility />,
          label: 'Preview Mode',
          action: () => setShowPreview(!showPreview)
        }
      ]
    },
    pages: {
      icon: <Pages />,
      title: 'Pages',
      panel: (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Pages</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {pages.map(page => (
              <Paper
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                sx={{
                  width: 80,
                  height: 100,
                  cursor: 'pointer',
                  border: currentPage === page.id ? '2px solid primary.main' : 'none'
                }}
              />
            ))}
            <Button
              variant="outlined"
              onClick={() => addNewPage()}
              sx={{ width: 80, height: 100 }}
            >
              <Add />
            </Button>
          </Box>
        </Box>
      )
    },
    viewOptions: {
      icon: <VisualModeIcon />,
      title: 'View Options',
      items: [
        {
          id: 'codeMode',
          icon: <CodeIcon />,
          label: 'Code Mode',
          action: () => setCodeMode(true)
        },
        {
          id: 'previewMode',
          icon: <PreviewIcon />,
          label: 'Preview Mode',
          action: () => setShowPreview(true)
        },
        {
          id: 'visualMode',
          icon: <VisualModeIcon />,
          label: 'Visual Mode',
          action: () => {
            setCodeMode(false);
            setShowPreview(false);
          }
        },
        {
          id: 'splitView',
          icon: <SplitViewIcon />,
          label: 'Split View',
          action: () => setShowCodePanel(true)
        }
      ]
    },
    pageManagement: {
      icon: <PagesIcon />,
      title: 'Page Management',
      items: [
        {
          id: 'addPage',
          icon: <AddPageIcon />,
          label: 'Add Page',
          action: addNewPage
        },
        {
          id: 'previewPages',
          icon: <PagePreviewIcon />,
          label: 'Preview Pages',
          action: () => setShowPreview(true)
        },
        {
          id: 'removePage',
          icon: <RemovePageIcon />,
          label: 'Remove Page',
          action: () => {
            if (pages.length > 1) {
              setPages(prev => prev.filter(p => p.id !== currentPage));
              setCurrentPage(pages[0].id);
            }
          }
        }
      ]
    },
  };

  const PageNavigation = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      bgcolor: 'background.paper'
    }}>
      <Typography variant="subtitle2">Pages:</Typography>
      <Box sx={{ display: 'flex', gap: 1, overflow: 'auto' }}>
        {pages.map((page) => (
          <Button
            key={page.id}
            variant={currentPage === page.id ? "contained" : "outlined"}
            size="small"
            onClick={() => setCurrentPage(page.id)}
          >
            {page.id}
          </Button>
        ))}
        <IconButton size="small" onClick={addNewPage}>
          <AddPageIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const StylePanel = () => (
    <Box sx={{ 
      width: 300,
      height: '100%',
      bgcolor: '#ffffff',
      borderLeft: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '-4px 0 16px rgba(0,0,0,0.05)',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '6px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#cfd8dc',
        borderRadius: '3px'
      }
    }}>
      {selectedElement && (
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ 
            mb: 3,
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            Style
          </Typography>
          {selectedElement.type === 'text' && (
            <TextStyleControls element={selectedElement} />
          )}
          <CommonStyleControls element={selectedElement} />
        </Box>
      )}
    </Box>
  );

  const TextStyleControls = ({ element }) => (
    <Box sx={{ p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Font Family</InputLabel>
        <Select
          value={element.style.fontFamily || 'Arial'}
          onChange={(e) => handleUpdateElement(element.id, {
            style: { ...element.style, fontFamily: e.target.value }
          })}
        >
          {['Arial', 'Times New Roman', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'].map(font => (
            <MenuItem key={font} value={font}>{font}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Font Size (px)"
            value={parseInt(element.style.fontSize) || 16}
            onChange={(e) => handleUpdateElement(element.id, {
              style: { ...element.style, fontSize: `${e.target.value}px` }
            })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Line Height"
            value={parseFloat(element.style.lineHeight) || 1.5}
            onChange={(e) => handleUpdateElement(element.id, {
              style: { ...element.style, lineHeight: e.target.value }
            })}
            inputProps={{ step: 0.1, min: 0.5, max: 3 }}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Text Color"
        type="color"
        value={element.style.color || '#000000'}
        onChange={(e) => handleUpdateElement(element.id, {
          style: { ...element.style, color: e.target.value }
        })}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Text Align</InputLabel>
          <Select
            value={element.style.textAlign || 'left'}
            onChange={(e) => handleUpdateElement(element.id, {
              style: { ...element.style, textAlign: e.target.value }
            })}
          >
            {['left', 'center', 'right', 'justify'].map(align => (
              <MenuItem key={align} value={align} sx={{ textTransform: 'capitalize' }}>
                {align}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant={element.style.fontWeight === 'bold' ? 'contained' : 'outlined'}
          onClick={() => handleUpdateElement(element.id, {
            style: { ...element.style, fontWeight: element.style.fontWeight === 'bold' ? 'normal' : 'bold' }
          })}
        >
          <FormatBold />
        </Button>
        <Button
          variant={element.style.fontStyle === 'italic' ? 'contained' : 'outlined'}
          onClick={() => handleUpdateElement(element.id, {
            style: { ...element.style, fontStyle: element.style.fontStyle === 'italic' ? 'normal' : 'italic' }
          })}
        >
          <FormatItalic />
        </Button>
        <Button
          variant={element.style.textDecoration === 'underline' ? 'contained' : 'outlined'}
          onClick={() => handleUpdateElement(element.id, {
            style: { ...element.style, textDecoration: element.style.textDecoration === 'underline' ? 'none' : 'underline' }
          })}
        >
          <FormatUnderlined />
        </Button>
      </Box>
    </Box>
  );

  const CommonStyleControls = ({ element }) => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Background</Typography>
      <TextField
        fullWidth
        label="Background Color"
        type="color"
        value={element.style.backgroundColor || '#ffffff'}
        onChange={(e) => handleUpdateElement(element.id, {
          style: { ...element.style, backgroundColor: e.target.value }
        })}
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle2" gutterBottom>Border</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Border Width (px)"
            value={parseInt(element.style.borderWidth) || 0}
            onChange={(e) => handleUpdateElement(element.id, {
              style: { ...element.style, borderWidth: `${e.target.value}px` }
            })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Border Radius (px)"
            value={parseInt(element.style.borderRadius) || 0}
            onChange={(e) => handleUpdateElement(element.id, {
              style: { ...element.style, borderRadius: `${e.target.value}px` }
            })}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Border Color"
        type="color"
        value={element.style.borderColor || '#000000'}
        onChange={(e) => handleUpdateElement(element.id, {
          style: { ...element.style, borderColor: e.target.value }
        })}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Border Style</InputLabel>
        <Select
          value={element.style.borderStyle || 'solid'}
          onChange={(e) => handleUpdateElement(element.id, {
            style: { ...element.style, borderStyle: e.target.value }
          })}
        >
          {['none', 'solid', 'dashed', 'dotted', 'double'].map(style => (
            <MenuItem key={style} value={style} sx={{ textTransform: 'capitalize' }}>
              {style}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle2" gutterBottom>Shadow</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Shadow Blur (px)"
            value={parseInt(element.style.boxShadow?.split(' ')[2]) || 0}
            onChange={(e) => handleUpdateElement(element.id, {
              style: {
                ...element.style,
                boxShadow: `0 0 ${e.target.value}px rgba(0,0,0,0.2)`
              }
            })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Opacity (%)"
            value={Math.round((element.style.opacity || 1) * 100)}
            onChange={(e) => handleUpdateElement(element.id, {
              style: { ...element.style, opacity: e.target.value / 100 }
            })}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const CanvasControls = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      p: 1.5, 
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      bgcolor: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {/* Page Size Control */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Page Size</InputLabel>
        <Select
          value={selectedFormat}
          onChange={(e) => handleFormatChange(e.target.value)}
          label="Page Size"
        >
          {Object.entries(paperFormats).map(([format, size]) => (
            <MenuItem key={format} value={format}>
              {format}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Orientation Toggle */}
      <Tooltip title="Toggle Orientation">
        <IconButton 
          onClick={handleOrientationChange}
          color={orientation === 'landscape' ? 'primary' : 'default'}
        >
          <RotateRight />
        </IconButton>
      </Tooltip>

      {/* Grid Toggle */}
      <Tooltip title={isGridEnabled ? "Hide Grid" : "Show Grid"}>
        <IconButton 
          onClick={() => setIsGridEnabled(!isGridEnabled)}
          color={isGridEnabled ? 'primary' : 'default'}
        >
          {isGridEnabled ? <GridOn /> : <GridOff />}
        </IconButton>
      </Tooltip>

      {/* Rulers Toggle */}
      <Tooltip title={rulers.show ? "Hide Rulers" : "Show Rulers"}>
        <IconButton 
          onClick={() => setRulers(prev => ({ ...prev, show: !prev.show }))}
          color={rulers.show ? 'primary' : 'default'}
        >
          <Straighten />
        </IconButton>
      </Tooltip>

      {/* Zoom Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          onClick={() => handleZoomChange(zoomLevel - 10)}
          disabled={zoomLevel <= 25}
        >
          <ZoomOut />
        </IconButton>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={zoomLevel}
            onChange={(e) => handleZoomChange(e.target.value)}
          >
            {[25, 50, 75, 100, 125, 150, 200, 300, 400].map((zoom) => (
              <MenuItem key={zoom} value={zoom}>
                {zoom}%
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton 
          onClick={() => handleZoomChange(zoomLevel + 10)}
          disabled={zoomLevel >= 400}
        >
          <ZoomIn />
        </IconButton>
      </Box>
    </Box>
  );

  const RulerMarkings = ({ orientation }) => {
    const markings = [];
    const size = orientation === 'horizontal' ? canvasSize.width : canvasSize.height;
    const step = 10; // 10px between markings

    for (let i = 0; i <= size; i += step) {
      markings.push(
        <Box
          key={i}
          sx={{
            position: 'absolute',
            ...(orientation === 'horizontal' ? {
              left: `${i}px`,
              top: 0,
              width: '1px',
              height: i % 50 === 0 ? '10px' : '5px'
            } : {
              left: 0,
              top: `${i}px`,
              width: i % 50 === 0 ? '10px' : '5px',
              height: '1px'
            }),
            bgcolor: 'text.secondary'
          }}
        >
          {i % 50 === 0 && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                ...(orientation === 'horizontal' ? {
                  top: '10px',
                  left: '-5px'
                } : {
                  left: '10px',
                  top: '-5px'
                })
              }}
            >
              {i}
            </Typography>
          )}
        </Box>
      );
    }

    return markings;
  };

  const Rulers = () => rulers.show ? (
    <>
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '20px',
        bgcolor: 'background.paper',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        overflow: 'hidden'
      }}>
        <RulerMarkings orientation="horizontal" />
      </Box>
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '20px',
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: '1px solid rgba(0,0,0,0.12)',
        overflow: 'hidden'
      }}>
        <RulerMarkings orientation="vertical" />
      </Box>
    </>
  ) : null;

  const DesignCanvas = () => (
    <Box sx={{ 
      position: 'relative',
      p: 3,
      bgcolor: '#f8fafc',
      minHeight: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <Rulers />
      <Paper
        ref={canvasRef}
        sx={{
          width: canvasSize.width,
          height: canvasSize.height,
          position: 'relative',
          backgroundColor: 'white',
          backgroundImage: isGridEnabled ? 
            'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)' : 'none',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: '50% 50%',
          transition: 'transform 0.3s ease',
          ml: rulers.show ? '20px' : 0,
          mt: rulers.show ? '20px' : 0,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {elements.map(element => (
          <DesignElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => setSelectedElement(element)}
            onChange={handleUpdateElement}
            isLocked={lockedElements[element.id]}
          />
        ))}
        {guides.map((guide, index) => (
          <DesignGuide key={index} guide={guide} />
        ))}
      </Paper>
    </Box>
  );

  const DesignElement = ({ element, isSelected, onSelect, onChange, isLocked }) => {
    const elementRef = useRef(null);
    const [resizing, setResizing] = useState(false);

    const handleDragStop = (e, data) => {
      if (isLocked) return;
      onChange(element.id, {
        ...element,
        position: { x: data.x, y: data.y }
      });
      saveToHistory({
        elements: elements.map(el => 
          el.id === element.id ? { ...el, position: { x: data.x, y: data.y } } : el
        ),
        canvasSize
      });
    };

    const handleResize = (e, direction, ref, delta, position) => {
      if (isLocked) return;
      const newWidth = parseInt(ref.style.width);
      const newHeight = parseInt(ref.style.height);
      
      onChange(element.id, {
        ...element,
        size: { width: newWidth, height: newHeight },
        position
      });
      
      if (!resizing) {
        saveToHistory({
          elements: elements.map(el =>
            el.id === element.id ? {
              ...el,
              size: { width: newWidth, height: newHeight },
              position
            } : el
          ),
          canvasSize
        });
      }
    };

    const renderElement = () => {
      switch (element.type) {
        case 'text':
          return (
            <div 
              style={{
                width: '100%',
                height: '100%',
                ...element.style
              }}
            >
              {element.content}
            </div>
          );
        case 'shape':
          return (
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: element.style.backgroundColor || '#e0e0e0',
                borderRadius: element.style.borderRadius || '0px'
              }}
            />
          );
        case 'image':
          return (
            <img 
              src={element.content} 
              alt="design element"
              style={{
                width: '100%',
                height: '100%',
                objectFit: element.style.objectFit || 'cover'
              }}
            />
          );
        case 'qrcode':
          return (
            <QRCodeSVG 
              value={element.content || 'https://example.com'}
              size={Math.min(element.size.width, element.size.height)}
            />
          );
        default:
          return null;
      }
    };

    return (
      <Rnd
        ref={elementRef}
        size={{ width: element.size.width, height: element.size.height }}
        position={{ x: element.position.x, y: element.position.y }}
        onDragStop={handleDragStop}
        onResize={handleResize}
        onResizeStart={() => setResizing(true)}
        onResizeStop={() => setResizing(false)}
        onClick={() => onSelect(element)}
        bounds="parent"
        dragGrid={isGridEnabled ? [gridSize, gridSize] : undefined}
        resizeGrid={isGridEnabled ? [gridSize, gridSize] : undefined}
        enableResizing={!isLocked}
        disableDragging={isLocked}
        style={{
          border: isSelected ? '2px solid #1976d2' : 'none',
          cursor: isLocked ? 'not-allowed' : 'move',
          zIndex: selectedElement?.id === element.id ? 1000 : 1
        }}
      >
        {renderElement()}
      </Rnd>
    );
  };

  const ElementToolbar = () => (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#ffffff',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header area */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={() => navigate('/admin/settings/templates')}
          sx={{ 
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'grey.100',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Template Editor
        </Typography>
      </Box>

      {/* Scrollable tools area */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cfd8dc',
          borderRadius: '3px'
        }
      }}>
        {Object.entries(toolbarGroups).map(([groupKey, group]) => (
          <Box key={groupKey} sx={{ 
            py: 1,
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              px: 2,
              py: 1,
              color: 'text.secondary',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              {group.title}
            </Typography>
            {group.items && Array.isArray(group.items) && group.items.map((item) => (
              <Tooltip key={item.id} title={item.label} placement="right">
                <Button
                  onClick={() => item.action ? item.action() : handleCreateElement(item.id)}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1,
                    color: 'text.primary',
                    transition: 'all 0.2s ease',
                    borderRadius: 0,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'primary.soft',
                      color: 'primary.main'
                    }
                  }}
                  startIcon={item.icon}
                >
                  <Typography sx={{ 
                    ml: 1, 
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    flexGrow: 1
                  }}>
                    {item.label}
                  </Typography>
                </Button>
              </Tooltip>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );

  const DesignGuide = ({ guide }) => (
    <Box
      sx={{
        position: 'absolute',
        backgroundColor: 'rgba(25, 118, 210, 0.5)',
        zIndex: 1000,
        ...(guide.orientation === 'vertical' ? {
          width: '1px',
          height: '100%',
          left: guide.position,
          top: 0
        } : {
          width: '100%',
          height: '1px',
          left: 0,
          top: guide.position
        })
      }}
    />
  );

  const CodeToolbar = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      p: 1, 
      borderBottom: 1, 
      borderColor: 'divider' 
    }}>
      <Tooltip title="Toggle Code/Visual Mode">
        <IconButton onClick={() => setCodeMode(!codeMode)}>
          <ToggleOn color={codeMode ? 'primary' : 'inherit'} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Toggle Preview">
        <IconButton onClick={() => setShowPreview(!showPreview)}>
          <RemoveRedEye color={showPreview ? 'primary' : 'inherit'} />
        </IconButton>
      </Tooltip>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
        >
          <MenuItem value="html">HTML/CSS</MenuItem>
          <MenuItem value="react">React Component</MenuItem>
          <MenuItem value="tailwind">Tailwind CSS</MenuItem>
        </Select>
      </FormControl>
      <IconButton onClick={() => exportCode(exportFormat)}>
        <ImportExport />
      </IconButton>
    </Box>
  );

  const handleCodeChange = (value, type) => {
    if (type === 'html') {
      setHtmlCode(value);
    } else {
      setCssCode(value);
    }
  };

  const CodePanel = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={codeTab} onChange={(e, newValue) => setCodeTab(newValue)}>
          <Tab label="HTML" />
          <Tab label="CSS" />
        </Tabs>
      </Box>
      <CodeToolbar />
      {showPreview ? (
        <SplitPane
          split="vertical"
          minSize={300}
          defaultSize={splitPaneSize}
          onChange={size => setSplitPaneSize(size)}
        >
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Editor
              language={codeTab === 0 ? 'html' : 'css'}
              value={codeTab === 0 ? htmlCode : cssCode}
              onChange={(value) => handleCodeChange(value, codeTab === 0 ? 'html' : 'css')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true,
              }}
            />
          </Box>
          <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'background.paper' }}>
            <iframe
              ref={previewRef}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Preview"
            />
          </Box>
        </SplitPane>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Editor
            language={codeTab === 0 ? 'html' : 'css'}
            value={codeTab === 0 ? htmlCode : cssCode}
            onChange={(value) => handleCodeChange(value, codeTab === 0 ? 'html' : 'css')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              automaticLayout: true,
            }}
          />
        </Box>
      )}
    </Box>
  );

  useEffect(() => {
    if (showPreview && previewRef.current) {
      const combinedCode = `
        <html>
          <head>
            <style>${cssCode}</style>
          </head>
          <body>${htmlCode}</body>
        </html>
      `;
      const doc = previewRef.current.contentDocument;
      doc.open();
      doc.write(combinedCode);
      doc.close();
    }
  }, [htmlCode, cssCode, showPreview]);

  const exportCode = (format) => {
    let code = '';
    switch (format) {
      case 'react':
        code = generateReactComponent();
        break;
      case 'tailwind':
        code = generateTailwindCode();
        break;
      default:
        code = `${htmlCode}\n\n<style>\n${cssCode}\n</style>`;
    }
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template.${format === 'react' ? 'jsx' : format === 'tailwind' ? 'jsx' : 'html'}`;
    a.click();
  };

  const generateTailwindCode = () => {
    // Convert CSS to Tailwind classes
    return `
      const Template = () => (
        <div className="relative w-[${canvasSize.width}px] h-[${canvasSize.height}px]">
          ${elements.map(generateTailwindElement).join('\n')}
        </div>
      );
    `;
  };

  const ProjectToolbar = () => (
    <Box sx={{ display: 'flex', gap: 1, p: 1, borderBottom: 1, borderColor: 'divider' }}>
      <IconButton onClick={saveProject} title="Save Project">
        <SaveAlt />
      </IconButton>
      <IconButton onClick={() => setShowTemplates(true)} title="Load Template">
        <FolderShared />
      </IconButton>
      <IconButton onClick={generateShareLink} title="Share">
        <CloudUpload />
      </IconButton>
      <Divider orientation="vertical" flexItem />
      <IconButton onClick={handleUndo} disabled={historyIndex <= 0} title="Undo">
        <Undo />
      </IconButton>
      <IconButton onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo">
        <Redo />
      </IconButton>
    </Box>
  );

  const TemplatesDialog = () => (
    <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="md" fullWidth>
      <DialogTitle>Templates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {savedTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card>
                <CardActionArea onClick={() => loadProject(template.id)}>
                  {/* Template preview */}
                  <Box sx={{ height: 200, bgcolor: 'grey.100' }} />
                  <CardContent>
                    <Typography variant="subtitle1">{template.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last modified: {new Date(template.updatedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#f8fafc'
    }}>
      {!codeMode ? (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
          <Box sx={{ 
            width: 280,
            borderRight: '1px solid rgba(0,0,0,0.08)',
            height: '100vh',
            overflow: 'hidden'
          }}>
            <ElementToolbar />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CanvasControls />
            <ProjectToolbar />
            <PageNavigation />
            <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
              <DesignCanvas />
            </Box>
          </Box>
          {selectedElement && (
            <StylePanel />
          )}
          {showCodePanel && <CodePanel />}
        </Box>
      ) : (
        <CodePanel />
      )}
      <TemplatesDialog />
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
        <DialogTitle>Share Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={() => navigator.clipboard.writeText(shareLink)}>
                  <FileCopy />
                </IconButton>
              ),
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Templates;

