"use client";
import { createContext, useContext } from "react";
export const UploadActivity=createContext<{begin:() => void;end:() => void}|null>(null);
export function useUploadActivity(){return useContext(UploadActivity);}
