export interface TableStructure {
    column: string;
    type: string;
    comment?: string;
    isForeignKey: boolean;
    referenced_table?: string;
    referenced_column?: string;
  }
  