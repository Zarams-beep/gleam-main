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
  // Only persist auth + org
  // sidebar is excluded because it contains non-serializable icon functions
  // user is excluded because it must always be re-fetched fresh from /me
  whitelist: ["auth", "org"],
  blacklist: ["sidebar", "user", "loginAuth", "stats"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

// One-time migration: clear stale sidebar data from localStorage
// The sidebar slice contains non-serializable icon functions and must never be persisted
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem("persist:root");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sidebar) {
        delete parsed.sidebar;
        localStorage.setItem("persist:root", JSON.stringify(parsed));
      }
    }
  } catch { /* ignore */ }
}

export { store, persistor };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
