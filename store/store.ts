import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import sideBarReducer from "./slices/sidebarSlices_";
import userReducer from "./slices/userSlice";
import orgReducer from "./slices/orgSlice";
import statsReducer from "./slices/statsSlice";

const rootReducer = combineReducers({
  sidebar: sideBarReducer,
  user: userReducer,
  org: orgReducer,
  stats: statsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  // Only persist org.
  // sidebar is excluded because it contains non-serializable icon functions
  // user is excluded because it must always be re-fetched fresh from /me
  whitelist: ["org"],
  blacklist: ["sidebar", "user", "stats"],
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
