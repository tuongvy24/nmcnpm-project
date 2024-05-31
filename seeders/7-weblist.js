"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let items = [
      {
        web_name: "https://ccfddl.github.io/",
      },
      {        
        web_name: "https://www.lix.polytechnique.fr/~hermann/conf.php",
      },  
      {
        web_name: "https://www.computer.org/conferences/top-computer-science-events"
      }   
    ];
    // items.forEach((item) => {
    //   item.createdAt = Sequelize.literal("NOW()");
    //   item.updatedAt = Sequelize.literal("NOW()");
    // });

    await queryInterface.bulkInsert("weblists", items, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("weblists", null, {});
  },
};
