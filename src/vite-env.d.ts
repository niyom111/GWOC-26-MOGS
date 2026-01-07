/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_EMAILJS_SERVICE_ID: string
    readonly VITE_EMAILJS_TEMPLATE_ID_ONLINE: string
    readonly VITE_EMAILJS_TEMPLATE_ID_COUNTER: string
    readonly VITE_EMAILJS_PUBLIC_KEY: string
    readonly VITE_RAZORPAY_KEY_ID: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
