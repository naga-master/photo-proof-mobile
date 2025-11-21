/// <reference types="expo/types" />

// Environment variables
declare module '@env' {
  export const API_URL: string;
  export const ENV: 'development' | 'staging' | 'production';
}

// Asset declarations
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.ttf';
declare module '*.otf';
