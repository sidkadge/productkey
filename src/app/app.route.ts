import { Routes } from '@angular/router';

// dashboard
import { IndexComponent } from './index';
import { AnalyticsComponent } from './analytics';
import { AdminDashComponent } from './admindashboard';
import { ConsultantsdashboardComponent } from './consultantsdashboard';

import { CryptoComponent } from './crypto';
import { ReportsComponent } from './reports';
import { manageSlotsComponent } from './manageSlots';

// widgets
import { WidgetsComponent } from './widgets';

// tables
import { TablesComponent } from './tables';

// font-icons
import { FontIconsComponent } from './font-icons';

// charts
import { ChartsComponent } from './charts';

// dragndrop
import { DragndropComponent } from './dragndrop';

// layouts
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';

// pages
import { KnowledgeBaseComponent } from './pages/knowledge-base';
import { FaqComponent } from './pages/faq';

// appointment form
import { AppointmentFormComponent } from './forms/appointment-form';

// auth components
import { BoxedSignupComponent } from './auth/boxed-signup'; // Import BoxedSignupComponent

import { PatientDetailsComponent } from './patientdetails'; // Import the component

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/signin', // Redirect root path to BoxedSignupComponent
        pathMatch: 'full',
    },
    {
        path: '',
        component: AppLayout,
        children: [
            // dashboard
            { path: '', component: AdminDashComponent, data: { title: 'Admin Dashboard' } },
            { path: 'analytics', component: AnalyticsComponent, data: { title: 'Analytics Admin' } },
            { path: 'Lading-Page', component: AdminDashComponent, data: { title: 'Lading Page' } },
            { path: 'Super-Admin', component: ConsultantsdashboardComponent, data: { title: 'Admin Dashboard' } },

            { path: 'crypto', component: CryptoComponent, data: { title: 'Crypto Admin' } },
            { path: 'Reports', component: ReportsComponent, data: { title: 'Reports' } },

            // widgets
            { path: 'widgets', component: WidgetsComponent, data: { title: 'Widgets' } },

            // font-icons
            { path: 'font-icons', component: FontIconsComponent, data: { title: 'Font Icons' } },

            // charts
            { path: 'charts', component: ChartsComponent, data: { title: 'Charts' } },

            // dragndrop
            { path: 'dragndrop', component: DragndropComponent, data: { title: 'Dragndrop' } },

            // pages
            { path: 'pages/knowledge-base', component: KnowledgeBaseComponent, data: { title: 'Knowledge Base' } },
            { path: 'pages/faq', component: FaqComponent, data: { title: 'FAQ' } },

            // apps
            { path: '', loadChildren: () => import('./apps/apps.module').then((d) => d.AppsModule) },

            // components
            { path: '', loadChildren: () => import('./components/components.module').then((d) => d.ComponentsModule) },

            // elements
            { path: '', loadChildren: () => import('./elements/elements.module').then((d) => d.ElementsModule) },

            // forms
            { path: '', loadChildren: () => import('./forms/form.module').then((d) => d.FormModule) },

            // users
            { path: '', loadChildren: () => import('./users/user.module').then((d) => d.UsersModule) },

            // tables
            { path: 'tables', component: TablesComponent, data: { title: 'Tables' } },
            { path: '', loadChildren: () => import('./datatables/datatables.module').then((d) => d.DatatablesModule) },
             // Patient Details route
             {
                path: 'patient-details/:id', // Route with dynamic 'id' parameter
                component: PatientDetailsComponent,
                data: { title: 'Patient Details' },
            },
        ],
    },
    {
        path: '',
        component: AuthLayout,
        children: [
            // Appointment Form Route without Sidebar
            { path: 'appointment-form', component: AppointmentFormComponent, data: { title: 'Appointment Form' } },

            // auth routes
            { path: 'auth/signin', component: BoxedSignupComponent, data: { title: 'Boxed SignIn' } }, // New signup path

            // additional pages
            { path: '', loadChildren: () => import('./pages/pages.module').then((d) => d.PagesModule) },

            // auth module
            { path: '', loadChildren: () => import('./auth/auth.module').then((d) => d.AuthModule) },
        ],
    },
];
