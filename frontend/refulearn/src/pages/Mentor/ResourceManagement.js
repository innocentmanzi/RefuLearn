import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  @media (max-width: 768px) {
    max-width: 100%;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UploadButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ResourceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResourceListItem = styled.li`
  background: white;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const ResourceInfo = styled.div`
  flex: 1;
`;

const ResourceName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 0.25rem 0;
`;

const ResourceMeta = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const ResourceActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${({ variant }) => 
    variant === 'delete' ? '#dc3545' : 
    variant === 'edit' ? '#6c757d' : 
    '#28a745'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  background: ${({ active }) => active ? '#007bff' : '#f8f9fa'};
  color: ${({ active }) => active ? 'white' : '#333'};
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ active }) => active ? '#0056b3' : '#e9ecef'};
  }
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ResourceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const ResourceHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResourceIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1rem;
`;

const ResourceDescription = styled.p`
  color: #444;
  margin: 1rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.secondary}20;
  color: ${({ theme }) => theme.colors.secondary};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const ResourceTags = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 0.5rem;
`;

const ResourceManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resources, setResources] = useState([
    {
      id: 1,
      name: 'JavaScript Fundamentals Guide',
      type: 'file',
      fileType: 'PDF',
      size: '2.5 MB',
      downloads: 156,
      category: 'documents',
      description: 'Comprehensive guide to JavaScript basics',
      uploadDate: '2025-06-01',
      url: 'https://example.com/javascript-guide.pdf'
    },
    {
      id: 2,
      name: 'React Hooks Tutorial Video',
      type: 'video',
      fileType: 'MP4',
      size: '50 MB',
      downloads: 89,
      category: 'videos',
      description: 'Deep dive into React Hooks with video examples',
      uploadDate: '2025-06-05',
      url: 'https://youtube.com/react-hooks-tutorial'
    },
    {
      id: 3,
      name: 'Node.js Best Practices Article',
      type: 'link',
      fileType: 'URL',
      size: '-',
      downloads: 234,
      category: 'links',
      description: 'External article on Node.js best practices',
      uploadDate: '2025-06-10',
      url: 'https://dev.to/nodejs-best-practices'
    },
    {
      id: 4,
      name: 'Python Basics Cheatsheet',
      type: 'file',
      fileType: 'DOCX',
      size: '1.2 MB',
      downloads: 70,
      category: 'documents',
      description: 'Quick reference for Python fundamentals',
      uploadDate: '2025-06-12',
      url: 'https://example.com/python-cheatsheet.docx'
    }
  ]);
  const [newResource, setNewResource] = useState({
    name: '',
    category: '',
    description: '',
    type: 'file',
    file: null,
    url: ''
  });
  const [editingResource, setEditingResource] = useState(null);

  const categories = [
    'all',
    'documents',
    'presentations',
    'videos',
    'links',
    'other'
  ];

  const filteredResources = resources.filter(resource =>
    (selectedCategory === 'all' || resource.category === selectedCategory) &&
    (resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpload = () => {
    if (newResource.name && newResource.category && (newResource.type === 'file' ? newResource.file : newResource.url)) {
      // Here you would typically make an API call to upload the resource
      console.log('Uploading resource:', newResource);
      setShowUploadModal(false);
      setNewResource({
        name: '',
        category: '',
        description: '',
        type: 'file',
        file: null,
        url: ''
      });
    } else {
      alert('Please fill all required fields.');
    }
  };

  const handleDownload = (resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      alert('No downloadable file or link available.');
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    setResources(resources.map(r => r.id === editingResource.id ? editingResource : r));
    setShowEditModal(false);
    setEditingResource(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingResource({ ...editingResource, [name]: value });
  };

  const handleDelete = (resource) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${resource.name}"?`);
    if (confirmDelete) {
      setResources(prev => prev.filter(r => r.id !== resource.id));
    }
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'pptx':
        return '📊';
      case 'docx':
        return '📝';
      case 'video':
        return '📹';
      case 'link':
        return '🔗';
      default:
        return '📁';
    }
  };

  return (
    <Container>
      <Title>Resource Management</Title>
      
      <Header>
        <SearchBar
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <UploadButton onClick={() => setShowUploadModal(true)}>
          Upload Resource
        </UploadButton>
      </Header>

      <CategoryFilter>
        {categories.map(category => (
          <CategoryButton
            key={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </CategoryButton>
        ))}
      </CategoryFilter>

      <ResourceGrid>
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id}>
            <ResourceHeader>
              <ResourceIcon>{getFileIcon(resource.type === 'file' ? resource.fileType : resource.type)}</ResourceIcon>
              <ResourceInfo>
                <ResourceName>{resource.name}</ResourceName>
                <ResourceMeta>
                  {resource.type === 'file' ? resource.fileType : resource.type.toUpperCase()} • {resource.size} • {resource.downloads} downloads
                </ResourceMeta>
              </ResourceInfo>
            </ResourceHeader>
            
            <ResourceDescription>{resource.description}</ResourceDescription>
            
            <ResourceTags>
              <Tag>{resource.category}</Tag>
              <Tag>Uploaded: {resource.uploadDate}</Tag>
            </ResourceTags>

            {resource.url && (
              <div style={{ marginBottom: '1rem' }}>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>View {resource.type}</span>
                  <i className="fas fa-external-link-alt"></i>
                </a>
              </div>
            )}
            
            <ActionButtons>
              <ActionButton variant="edit" onClick={() => handleEdit(resource)}>Edit</ActionButton>
              <ActionButton variant="delete" onClick={() => handleDelete(resource)}>Delete</ActionButton>
            </ActionButtons>
          </ResourceCard>
        ))}
      </ResourceGrid>

      {showUploadModal && (
        <Modal>
          <ModalContent>
            <h3>Upload New Resource</h3>
            <FormGroup>
              <Label>Resource Name</Label>
              <Input
                type="text"
                value={newResource.name}
                onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                placeholder="Enter resource name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Resource Type</Label>
              <Select
                value={newResource.type}
                onChange={(e) => setNewResource({...newResource, type: e.target.value, file: null, url: ''})}
              >
                <option value="file">File</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Select
                value={newResource.category}
                onChange={(e) => setNewResource({...newResource, category: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={newResource.description}
                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                placeholder="Enter resource description"
              />
            </FormGroup>
            {newResource.type === 'file' ? (
              <FormGroup>
                <Label>File</Label>
                <Input
                  type="file"
                  onChange={(e) => setNewResource({...newResource, file: e.target.files[0], url: ''})}
                />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>URL</Label>
                <Input
                  type="text"
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value, file: null})}
                  placeholder="Enter URL"
                />
              </FormGroup>
            )}
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleUpload}>Upload</Button>
              <Button 
                onClick={() => setShowUploadModal(false)}
                style={{ background: '#666' }}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {showEditModal && editingResource && (
        <Modal>
          <ModalContent>
            <h3>Edit Resource</h3>
            <FormGroup>
              <Label>Resource Name</Label>
              <Input
                type="text"
                name="name"
                value={editingResource.name}
                onChange={handleEditChange}
                placeholder="Enter resource name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Resource Type</Label>
              <Select
                name="type"
                value={editingResource.type}
                onChange={handleEditChange}
              >
                <option value="file">File</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Select
                name="category"
                value={editingResource.category}
                onChange={handleEditChange}
              >
                <option value="">Select category</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={editingResource.description}
                onChange={handleEditChange}
                placeholder="Enter resource description"
              />
            </FormGroup>
            {editingResource.type === 'file' ? (
              <FormGroup>
                <Label>File</Label>
                <Input
                  type="file"
                  onChange={(e) => setEditingResource({...editingResource, file: e.target.files[0], url: ''})}
                />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>URL</Label>
                <Input
                  type="text"
                  name="url"
                  value={editingResource.url}
                  onChange={handleEditChange}
                  placeholder="Enter URL"
                />
              </FormGroup>
            )}
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleEditSave}>Save</Button>
              <Button onClick={() => { setShowEditModal(false); setEditingResource(null); }} style={{ background: '#666' }}>
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ResourceManagement; 