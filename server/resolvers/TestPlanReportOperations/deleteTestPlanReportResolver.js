const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanReport
} = require('../../models/services/TestPlanReportService');
const {
    removeTestPlanRunByQuery
} = require('../../models/services/TestPlanRunService');

const deleteTestPlanReportResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await removeTestPlanRunByQuery({ testPlanReportId });
    await removeTestPlanReport(testPlanReportId);

    return true;
};

module.exports = deleteTestPlanReportResolver;
