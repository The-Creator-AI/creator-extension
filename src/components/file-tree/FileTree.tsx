import React, { useEffect, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import Checkbox from '../Checkbox';
import { FileNode } from 'src/types/file-node';

interface FileTreeProps {
  data: FileNode[];
  onFileClick?: (filePath: string) => void;
  selectedFiles: string[];
  recentFiles: string[];
  activeFile?: string;
  updateSelectedFiles: (selectedFiles: string[]) => void;
  updateRecentFiles: (recentFiles: string[]) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  data,
  onFileClick,
  selectedFiles,
  recentFiles,
  activeFile,
  updateSelectedFiles,
  updateRecentFiles
}) => {
  const rootNode = data.find((node) => !node.name.includes('/'));
  const [expandedNodes, setExpandedNodes] = useState<string[]>([rootNode?.name || '']);

  useEffect(() => {
    // If selectedFiles changes, expand the corresponding nodes
    const toExpand = new Set<string>();
    selectedFiles?.forEach((selectedFile) => {
      const pathParts = selectedFile.split('/');
      // Starting from the root, expand each directory in the path
      let currentPath = '';
      pathParts.forEach((part, index) => {
        currentPath += `${currentPath ? '/' : ''}${part}`;
        const node = getNodeByPath(currentPath);
        const isLast = index === pathParts.length - 1;
        if (node && !isLast) {
          toExpand.add(currentPath);
        }
      });
    });

    setExpandedNodes(prevExpandedNodes => {
      const newExpandedNodes = [...prevExpandedNodes].filter(path => !toExpand.has(path));
      return [...newExpandedNodes, ...Array.from(toExpand)];
    });
  }, [selectedFiles, data]);

  const handleNodeClick = (e: React.MouseEvent<HTMLElement, MouseEvent>, node: FileNode, path: string) => {
    if ((e.target as HTMLElement)?.classList?.contains('checkbox')) {
      return;
    }
    const isDirectory = Array.isArray(node.children);
    if (isDirectory) {
      setExpandedNodes((prevExpandedNodes) => {
        const isExpanded = !!prevExpandedNodes.find((n) => n === path);
        return isExpanded
          ? prevExpandedNodes.filter((n) => n !== path)
          : [...prevExpandedNodes, path];
      });
    } else {
      onFileClick && onFileClick(path);
      const existingRecentFiles = recentFiles.filter(f => f !== path);
      updateRecentFiles([path, ...existingRecentFiles || []]);
    }
  };

  const getNodeByPath = (path: string): FileNode | null => {
    const pathParts = path.split('/');
    // let's find the node in the data
    let node = {
      name: '',
      children: data,
    } as FileNode | undefined;
    for (const part of pathParts) {
      if (!node) return null;
      node = node.children?.find((child) => child.name === part);
    }
    return node || null;
  };

  const handleFileCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const isSelected = !!selectedFiles?.find(f => f === path);
    if (isSelected) {
      // Remove this file from selectedFiles
      updateSelectedFiles(selectedFiles?.filter(f => f !== path));
      return;
    }

    const selectedAncestorPath = selectedFiles.find(f => path.startsWith(f) && f !== path);
    if (selectedAncestorPath) {
      // 1. Remove the ancestor from selectedFiles
      // 2. Add all children of the ancestor to selectedFiles except node which is another ancestor of the selected node
      // 3. Add all the siblings of the all the nodes between the ancestor and the selected node
      const pathParts = path.split('/');
      const ancestorParts = selectedAncestorPath.split('/');
      // const ancestorNode = getNodeByPath(selectedAncestorPath);
      // const parentNode = getNodeByPath(pathParts.slice(0, pathParts.length - 1).join('/'));
      let siblingsAtEveryLevel = [] as string[];
      for (let i = ancestorParts.length - 1; i < pathParts.length - 1; i++) {
        const level = pathParts.slice(0, i + 1).join('/');
        const levelNode = getNodeByPath(level);
        if (levelNode) {
          siblingsAtEveryLevel = [
            ...siblingsAtEveryLevel,
            ...levelNode.children?.filter(c => c.name !== pathParts[i + 1])?.map(c => `${level}/${c.name}`) || [],
          ];
        }
      }
      const newSelectedFiles = [
        ...selectedFiles.filter(f => !f.includes(selectedAncestorPath)),
        ...siblingsAtEveryLevel
      ];
      updateSelectedFiles(newSelectedFiles);
      return;
    }

    // Remove all children and push this file into selectedFiles
    const newSelectedFiles = isSelected
      ? selectedFiles?.filter(f => f !== path)
      : [
        ...selectedFiles.filter(f => !f.includes(path)),
        path
      ];
    updateSelectedFiles(newSelectedFiles);
  };

  const renderCheckbox = (path: string) => {
    const isSelected = !!selectedFiles?.find(f => f === path);
    const isPartiallySelected = selectedFiles?.filter(f => f.includes(path) && f !== path);
    const selectedAncestors = selectedFiles?.filter(f => path.startsWith(f) && f !== path);
    return (
      <Checkbox
        data-testid="checkbox"
        indeterminate={isPartiallySelected?.length > 0}
        className="mr-2"
        checked={isSelected || !!selectedAncestors?.length}
        onChange={(_, e) => handleFileCheckboxChange(e, path)}
      />
    );
  };


  const renderTreeNodes = (nodes: FileNode[], parentPath = '') => {
    return nodes?.map((node) => {
      const path = `${parentPath}${node.name}`;
      const isExpanded = expandedNodes.includes(path);
      const isSelected = selectedFiles?.includes(path);
      const isDirectory = Array.isArray(node.children);
      const isActive = activeFile === path;

      return (
        <li key={path} data-testid="list-item" className="relative px-0 py-0 ml-4">
          <div
            data-testid="node"
            onClick={(e) => handleNodeClick(e, node, path)}
            className={`
              relative 
              cursor-pointer 
              px-2 py-1 
              flex 
              items-center
              z-1
              ${isActive ? 'bg-[#e0dcdc]' : ''}
              hover:bg-[#e4e6f1]
              ${isDirectory ? 'font-medium' : 'font-normal'}
            `}
          >
            {isDirectory && (
              <span
                data-testid="arrow"
                className={`
                  absolute 
                  left-[-12px] 
                  top-1
                  text-xl 
                  ${isExpanded ? 'rotate-90' : ''}
                `}
              >
                <MdChevronRight />
              </span>
            )}
            {renderCheckbox(path)}
            <div data-testid="name" className="whitespace-nowrap overflow-hidden text-ellipsis">{node.name}</div>
          </div>
          {isDirectory && isExpanded && (
            <ul data-testid="child-nodes">{renderTreeNodes(node.children || [], `${path}/`)}</ul>
          )}
        </li>
      );
    });
  };

  return (
    <div data-testid="file-tree" className="font-sans">
      <ul data-testid="root-nodes">{renderTreeNodes(data)}</ul>
    </div>
  );
};

export default FileTree;