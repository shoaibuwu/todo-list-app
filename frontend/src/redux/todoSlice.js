import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Base API URL: uses relative URL to leverage Vite proxy, falls back to direct port 8001
const API_BASE = "/api/v1/todos";

// 1. Fetch all todos
export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_BASE);
      // Response structure: { success: true, count: n, data: [...] }
      return response.data.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to fetch todos";
      return rejectWithValue(message);
    }
  },
);

// 2. Create new todo
export const createTodo = createAsyncThunk(
  "todos/createTodo",
  async (todoData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_BASE, todoData);
      return response.data.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to create todo";
      return rejectWithValue(message);
    }
  },
);

// 3. Update todo
export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_BASE}/${id}`, updates);
      return response.data.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to update todo";
      return rejectWithValue(message);
    }
  },
);

// 4. Delete todo
export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE}/${id}`);
      return id;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete todo";
      return rejectWithValue(message);
    }
  },
);

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    loading: false,
    actionLoadingId: null,
    error: null,
    statusFilter: "all",
    priorityFilter: "all",
    searchQuery: "",
    sortBy: "created_desc",
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Todo
      .addCase(createTodo.pending, (state) => {
        state.actionLoadingId = "creating";
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.items.unshift(action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      })

      // Update Todo
      .addCase(updateTodo.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      })

      // Delete Todo
      .addCase(deleteTodo.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });
  },
});

export const {
  setStatusFilter,
  setPriorityFilter,
  setSearchQuery,
  setSortBy,
  clearError,
} = todoSlice.actions;

export default todoSlice.reducer;
