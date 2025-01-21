export interface ButtonProps {
  /** The text content of the button */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional additional CSS class names */
  className?: string;
} 