export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  note: string | null;
  date: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  limit_amount: number;
};

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      categories: Table<Category, Pick<Category, "name" | "type"> & Partial<Pick<Category, "id" | "user_id">>>;
      transactions: Table<Transaction,
        Pick<Transaction, "category_id" | "amount" | "type"> &
        Partial<Pick<Transaction, "id" | "user_id" | "note" | "date" | "created_at">>>;
      budgets: Table<Budget, Pick<Budget, "category_id" | "month" | "limit_amount"> & Partial<Pick<Budget, "id" | "user_id">>>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { transaction_type: TransactionType };
    CompositeTypes: { [_ in never]: never };
  };
};
