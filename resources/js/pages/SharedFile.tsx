import { useState, useEffect, useRef, use } from "react";
import { Head, router,useForm,Link  } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import MusicPlayer from "@/components/MusicPlayer";
import axios from "axios";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function SharedFile(){
    return(<>
    <AppLayout breadcrumbs={null}>

    </AppLayout>

    </>)
}