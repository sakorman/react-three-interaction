import styled from 'styled-components';

export const DropdownContainer = styled.div`
  position: fixed;
  top: 70px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  min-width: 180px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

export const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:active {
    background-color: #e6f7ff;
  }
  
  .anticon {
    font-size: 16px;
    color: #666;
  }
`;

export const DropdownSeparator = styled.div`
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
`; 