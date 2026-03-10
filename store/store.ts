import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlices";
import authLoginReducer from "./slices/loginSlices";
import sideBarReducer from "./slices/sidebarSlices_";
import userReducer from "./slices/userSlice";
import orgReducer from "./slices/orgSlice";
import statsReducer from "./slices/statsSlice";

const rootReducer = combineReducers({
  // legacy (kept for existing auth pages)
  auth: authReducer,
  loginAuth: authLoginReducer,
  sidebar: sideBarReducer,
  // new gleam slices
  user: userReducer,
  org: orgReducer,
  stats: statsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  // ✅ Do NOT persist "user" — it always gets re-fetched from /me on load
  // Persisting user caused stale name/role from previous sessions to show
  whitelist: ["auth", "org"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

export { store, persistor };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
