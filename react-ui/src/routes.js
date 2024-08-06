import React, { Suspense, Fragment, lazy } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import GuestGuard from './components/Auth/GuestGuard';
import AuthGuard from './components/Auth/AuthGuard';

import { BASE_URL } from './config/constant';

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Switch>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Component = route.component;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            render={(props) => (
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Component {...props} />}</Layout>
              </Guard>
            )}
          />
        );
      })}
    </Switch>
  </Suspense>
);

const routes = [
  {
    exact: true,
    guard: GuestGuard,
    path: '/auth/signin-1',
    component: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: true,
    path: '/auth/signup-1',
    component: lazy(() => import('./views/auth/signup/SignUp1'))
  },
  {
    exact: true,
    path: '/auth/reset-password-1',
    component: lazy(() => import('./views/auth/reset-password/ResetPassword1'))
  },
  {
    exact: true,
    path: '/auth/change-password',
    component: lazy(() => import('./views/auth/ChangePassword'))
  },
  {
    exact: true,
    path: '/auth/profile-settings',
    component: lazy(() => import('./views/auth/ProfileSettings'))
  },
  {
    path: '*',
    layout: AdminLayout,
    guard: AuthGuard,
    routes: [
      {
        exact: true,
        path: '/app/dashboard/default',
        component: lazy(() => import('./views/dashboard/DashDefault'))
      },
      {
        exact: true,
        path: '/viewer',
        component: lazy(() => import('./views/template/viewer/Viewer'))
      },
      {
        exact: true,
        path: '/template/list',
        component: lazy(() => import('./views/template/estimate/estimate-template/TemplateList'))
      },
      {
        exact: true,
        path: '/estimate/listed',
        component: lazy(() => import('./views/tables/IfcTable'))
      },
      {
        exact: true,
        path: '/estimate/list/:id',
        component: lazy(() => import('./views/tables/IfcTable'))
      },
      {
        exact: true,
        path: '/estimate',
        component: lazy(() => import('./views/template/estimate'))
      },
      {
        exact: true,
        path: '/template/list',
        component: lazy(() => import('./views/template/estimate/estimate-template/TemplateList'))
      },
      {
        exact: true,
        path: '/estimate/list/id/details',
        component: lazy(() => import('./views/template/estimate/estimatedetails/EstimateDetails'))
      },
      {
        exact: true,
        path: '/estimate/create',
        component: lazy(() => import('./views/template/estimate/estimates/createEstimate/CreateEstimate'))
      },
      {
        exact: true,
        path: '/estimate/list/id/Costings',
        component: lazy(() => import('./views/template/estimate/costings/Costings'))
      },
      // {
      //   exact: true,
      //   path: '/estimate/create',
      //   component: lazy(() => import('./views/template/estimate/estimates/createEstimate'))
      // },
      {
        exact: true,
        path: '/library',
        component: lazy(() => import('./views/template/library/Library'))
      },
      {
        exact: true,
        path: '/templates',
        component: lazy(() => import('./views/template/templates/Templates'))
      },
      {
        exact: true,
        path: '/circularstatic',
        component: lazy(() => import('./views/template/estimate/CircularStatic'))
      },
      {
        exact: true,
        path: '/error',
        component: lazy(() => import('./views/template/estimate/HandleAsyncError'))
      },
      {
        exact: true,
        path: '/tables/bootstrap',
        component: lazy(() => import('./views/tables/BootstrapTable'))
      },
      {
        exact: true,
        path: '/tables/dashboardtable',
        component: lazy(() => import('./views/tables/DashboardTable'))
      },
      {
        path: '*',
        exact: true,
        component: () => <Redirect to={BASE_URL} />
      }
    ]
  }
];

export default routes;
