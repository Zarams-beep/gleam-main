import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
// import authReducer from './slices/authSlices';
// import sidebarReducer from './slices/sideBarSlices';
// Combine all reducers
const rootReducer = combineReducers({
//   sidebar: sidebarReducer,
//   auth: authReducer,
});

// Persist config
const persistConfig = {
  key: 'root',
  storage,
//   whitelist: ['sidebar','auth',],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for redux-persist compatibility
    }),
});

// Create persistor
const persistor = persistStore(store);
export { store, persistor };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

