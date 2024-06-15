'use strict';

const controller = {};
const models = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const lastCrawlResults = require('./cronJobs'); // Import results from cron job

// View list of websites in a combo box on the index page
controller.viewList = async (req, res) => {
    try {
        let weblists = await models.Weblist.findAll({
            include: [{ model: models.Conference }]
        });

        res.locals.weblists = weblists;
        res.locals.crawlResults = lastCrawlResults; // Pass results to view

        console.log('Controller: -----lastCrawlResults: ', lastCrawlResults);

        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        res.render('index', { successMessage: successMessage, errorMessage: errorMessage });
    } catch (error) {
        console.error('Error in viewList:', error);
        req.flash('error', 'An error occurred while fetching the web list.');
        res.redirect('/');
    }
};

// Middleware to clear req.flash after each submission
const clearFlash = (req, res, next) => {
    req.flash = {}; // Clear all flash messages
    next(); // Pass control to the next middleware
};

controller.addWeblist = async (req, res) => {
    const selectedWebsite = req.body.selectedWebsite;
    let crawlData, saveDataToDatabase;
    let insertedCount = 0;

    console.log('req.body', req.body.selectedWebsite);

    // Handle based on selected website
    try {
        switch (selectedWebsite) {
            case '1':
                const crawler1 = require('./crawler1');
                crawlData = crawler1.crawlData;
                saveDataToDatabase = crawler1.saveDataToDatabase;
                break;
            case '2':
                const crawler2 = require('./crawler2');
                crawlData = crawler2.crawlData;
                saveDataToDatabase = crawler2.saveDataToDatabase;
                break;
            case '3':
                const crawler3 = require('./crawler3');
                crawlData = crawler3.crawlData;
                saveDataToDatabase = crawler3.saveDataToDatabase;
                break;
            default:
                console.log('Invalid website');
                req.flash('error', 'Invalid website selected');
                return res.redirect('/home');
        }

        async function processData() {
            try {
                const data = await crawlData();
                insertedCount = await saveDataToDatabase(data);
                console.log(`Data has been saved to the database successfully. ${insertedCount} rows inserted.`);
                req.flash('success', `Data successfully added! Number of new rows: ${insertedCount}`);
            } catch (error) {
                console.error('Error while processing data:', error);
                req.flash('error', `Error while processing data: ${error.message}`);
            }
        }

        await processData();
        res.redirect('/home');
    } catch (error) {
        console.error('Error in addWeblist:', error);
        req.flash('error', `An unexpected error occurred: ${error.message}`);
        res.redirect('/home');
    }
};

module.exports = controller;
