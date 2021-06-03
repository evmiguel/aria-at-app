const { sequelize } = require('../');

/**
 * Created Query Sequelize Example:
 * UserModel.findOne({
 *   where: { id },
 *   attributes: [ 'username', email ],
 *   include: [
 *     {
 *       model: RoleModel,
 *       as: 'roles'
 *       attributes: [ 'name', 'permissions' ]
 *     }
 *   ]
 * })
 *
 * @example
 * // returns { attribute: 'value', associationData: [ { associationAttribute: 'associationAttributeValue' } ] }
 * return ModelService.getById(Model, id, [ 'attribute' ], [
 *   {
 *     model: AssociationModel,
 *     as: 'associationData',
 *     attributes: [ 'associationAttribute' ]
 *   }
 * ]
 *
 * @param {Model} model - Sequelize Model instance to query for
 * @param {number | string} id - ID of the Sequelize Model to query for
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @returns {Promise<Model>} - Sequelize Model
 */
const getById = async (model, id, attributes = [], include = []) => {
    if (!model) throw new Error('Model not defined');

    // findByPk
    return await model.findOne({
        where: { id },
        attributes,
        include
    });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} queryParams - values to be used to query Sequelize Model
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @returns {Promise<Model>} - Sequelize Model
 */
const getByQuery = async (
    model,
    queryParams,
    attributes = [],
    include = []
) => {
    if (!model) throw new Error('Model not defined');

    return await model.findOne({
        where: { ...queryParams },
        attributes,
        include
    });
};

/**
 * @link {https://sequelize.org/v5/manual/models-usage.html#-code-findandcountall--code----search-for-multiple-elements-in-the-database--returns-both-data-and-total-count}
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} where - values to be used to search Sequelize Model
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @param {object} pagination - pagination options for query (page and limit; it also includes sorting functionality)
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>} - collection of queried Sequelize Models or paginated structure if pagination flag is enabled
 */
const get = async (
    model,
    where = {}, // passed in search and filtering options
    attributes = [],
    include = [],
    pagination = {}
) => {
    if (!model) throw new Error('Model not defined');

    // pagination and sorting options
    let {
        page = 0,
        limit = 10,
        order = [],
        enablePagination = false
    } = pagination; // page 0->1, 1->2; manage through middleware
    // 'order' structure eg. [ [ 'username', 'DESC' ], [..., ...], ... ]
    if (page < 0) page = 0;
    if (limit < 0 || !enablePagination) limit = null;
    const offset = limit < 0 || !limit ? 0 : page * limit; // skip (1 * 10 results) = 10 to get get to page 2

    const queryOptions = {
        where,
        order,
        attributes,
        include // included fields being marked as 'required' will affect overall count for pagination
    };

    // enablePagination paginated result structure and related values
    if (enablePagination) {
        const result = await model.findAndCountAll({
            ...queryOptions,
            limit,
            offset,
            distinct: true // applies distinct SQL rule to avoid duplicates created by 'includes' affecting count
        });

        const { count: totalResultsCount, rows: data } = result;
        const resultsCount = data.length;
        const pagesCount = limit ? Math.ceil(totalResultsCount / limit) : 1;

        return {
            page: page + 1,
            pageSize: limit,
            pagesCount,
            resultsCount,
            totalResultsCount,
            data
        };
    }
    return await model.findAll({ ...queryOptions });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} createParams - properties to be used to create the {@param model} Sequelize Model that is being used
 * @returns {Promise<*>} - result of the sequelize.create function
 */
const create = async (model, createParams) => {
    if (!model) throw new Error('Model not defined');
    return await model.create({ ...createParams });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} queryParams - query to be used to find the Sequelize Model to be updated
 * @param {object} updateParams - values to be updated when the Sequelize Model is found
 * @returns {Promise<*>} - result of the sequelize.update function
 */
const update = async (model, queryParams, updateParams) => {
    if (!model) throw new Error('Model not defined');

    return await model.update(
        { ...updateParams },
        { where: { ...queryParams } }
    );
};

// TODO: update description
/**
 * Upcerts/finds or creates multiple records for multiple models as part of a
 * single transaction.
 *
 * Accepts an array of functions so that you can use the results of previous
 * operations, e.g. the ids, in your queries.
 *
 * Each function should return a array containing a model, fields to find or
 * create, and options.
 *
 * The update option is an object of fields to update on the model, but not to
 * be used for determining whether the record already exists.
 *
 * Returns an array of results, where each item is an array containing the model
 * instance and a boolean for whether it was newly created.
 *
 * @example
 * const results = await nestedFindOrCreate([
 *   () => [AtVersion, { atId: 1, version: "2221.1" }],
 *   () => [BrowserVersion, { browserId: 1, version: "9999.0" }],
 *   () => [
 *     TestPlanTarget,
 *     {
 *       atId: 1,
 *       browserId: 1,
 *       atVersion: "2221.1",
 *       browserVersion: "9999.0",
 *     },
 *   ],
 *   ([_, __, [testPlanTarget]]) => [
 *     TestPlanReport,
 *     { testPlanTargetId: testPlanTarget.id, testPlanVersionId: 1 },
 *     { update: [updateTestPlanReport, { status: "DRAFT" }] },
 *   ],
 * ]);
 *
 * const [
 *   [atVersion, isNewAtVersion],
 *   [browserVersion, isNewBrowserVersion],
 *   [testPlanTarget, isNewTestPlanTarget],
 *   [testPlanReport, isNewTestPlanReport],
 * ] = results;
 *
 * @param {[object|function]} getOptionsArray
 * @returns {Promise<[[*,Boolean]]>}
 */
const nestedGetOrCreate = async getOptionsArray => {
    return await sequelize.transaction(async transaction => {
        let accumulatedResults = [];
        for (const getOptions of getOptionsArray) {
            const [
                get,
                create,
                update,
                values,
                updateValues,
                returnAttributes
            ] =
                typeof getOptions === 'function'
                    ? getOptions(accumulatedResults)
                    : getOptions;

            const pagination = null;

            const found = await get(values, ...returnAttributes, pagination, {
                transaction
            });

            if (found) {
                if (updateValues) {
                    await update(
                        found.id,
                        updateValues,
                        ...returnAttributes,
                        pagination,
                        { transaction }
                    );
                }
                accumulatedResults.push([found, false]);
                continue;
            }

            const created = await create(
                { ...values, ...updateValues },
                ...returnAttributes,
                pagination,
                { transaction }
            );

            accumulatedResults.push([created, true]);
        }

        return accumulatedResults;
    });
};

/**
 * See {@link https://sequelize.org/v5/class/lib/model.js~Model.html#static-method-destroy}
 * @param {Model} model - Sequelize Model instance to query for
 * @param {number | string} id - ID of the Sequelize Model to be removed
 * @param {object} deleteOptions - additional Sequelize deletion options
 * @param {boolean} [deleteOptions.truncate=false] - enables the truncate option to be used when running a deletion
 * @returns {Promise<boolean>} - returns true if record was deleted
 */
const removeById = async (model, id, deleteOptions = { truncate: false }) => {
    if (!model) throw new Error('Model not defined');

    const { truncate } = deleteOptions;
    await model.destroy({
        where: { id },
        truncate
    });
    return true;
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param queryParams - query params to be used to find the Sequelize Models to be removed
 * @param {object} deleteOptions - additional Sequelize deletion options
 * @param {boolean} [deleteOptions.truncate=false] - enables the truncate option to be used when running a deletion
 * @returns {Promise<boolean>} - returns true if record was deleted
 */
const removeByQuery = async (
    model,
    queryParams,
    deleteOptions = { truncate: false }
) => {
    if (!model) throw new Error('Model not defined');

    const { truncate } = deleteOptions;
    await model.destroy({
        where: { ...queryParams },
        truncate
    });
    return true;
};

/**
 * See @link {https://sequelize.org/v5/manual/raw-queries.html} for related documentation in case of expanding
 * @param {string} query - raw SQL query string to be executed
 * @returns {Promise<*>} - results of the raw SQL query after being ran
 */
const rawQuery = async query => {
    const [results /*, metadata*/] = await sequelize.query(query);
    return results;
};

module.exports = {
    getById,
    getByQuery,
    get,
    create,
    update,
    nestedGetOrCreate,
    removeById,
    removeByQuery,
    rawQuery
};
