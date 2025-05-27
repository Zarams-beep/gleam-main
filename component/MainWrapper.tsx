"use client";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "@/store/store";
import { ReactNode } from "react";
import ClientSideWrapper from "./ClientsiteWrapper";

type MainWrapperProps = {
  children: ReactNode;
};

export default function MainWrapper({ children }: MainWrapperProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ClientSideWrapper>{children}</ClientSideWrapper>
      </PersistGate>
    </Provider>
  );
}