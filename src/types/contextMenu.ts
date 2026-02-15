export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  checked?: boolean;
  keepOpen?: boolean;
}
