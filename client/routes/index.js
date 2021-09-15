import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import ConfigureActiveRuns from '@components/ConfigureActiveRuns';
import ConfirmAuth from '@components/ConfirmAuth';
import Home from '@components/Home';
import InvalidRequest from '@components/InvalidRequest';
import NotFound from '@components/NotFound';
import ReportsPage from '@components/ReportsPage';
import TestPlanReportPage from '@components/TestPlanReportPage';
import SignupInstructions from '@components/SignupInstructions';
import TestQueue from '@components/TestQueue';
import TestRun from '@components/TestRun';
import UserSettings from '@components/UserSettings';

export default [
    {
        path: '/',
        exact: true,
        component: Home
    },
    {
        path: '/signup-instructions',
        exact: true,
        component: SignupInstructions
    },
    {
        path: '/account/settings',
        exact: true,
        component: () => {
            return (
                <ConfirmAuth requiredPermission="TESTER">
                    <Route component={UserSettings} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/test-queue',
        exact: true,
        component: () => {
            return (
                <ConfirmAuth requiredPermission="TESTER">
                    <Route component={TestQueue} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/admin/configure-runs',
        exact: true,
        component: () => {
            return (
                <ConfirmAuth requiredPermission="ADMIN">
                    <Route component={ConfigureActiveRuns} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/run/:runId(\\d+)',
        component: () => {
            return (
                <ConfirmAuth requiredPermission="TESTER">
                    <Route component={TestRun} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/reports/test-plans/:testPlanId(\\d+)',
        component: TestPlanReportPage
    },
    {
        path: '/reports',
        component: ReportsPage
    },
    {
        path: '/invalid-request',
        exact: true,
        component: InvalidRequest
    },
    {
        path: '/404',
        exact: true,
        component: NotFound
    },
    {
        component: () => {
            return <Redirect to={{ pathname: '/404' }} />;
        }
    }
];
