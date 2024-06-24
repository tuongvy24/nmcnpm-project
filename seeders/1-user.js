"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const items = [
      {
        email: "admin@mail.com",
        password: "AXI3CxWdu",
        firstName: "Enrico",
        lastName: "De Ferraris",
        mobile: "506-883-2766",
        imagePath: "/img/blog/details/details-author.jpg",
        isAdmin: true,
      },
      {
        email: "user@abc.net",
        password: "kUzhyPDAB",
        firstName: "User",
        lastName: "ABC",
        mobile: "685-500-0168",
        imagePath: "/img/blog/details/details-author.jpg",
      },
      {
        email: "lcarlick1@furl.net",
        password: "kUzhyPDAB",
        firstName: "Lisle",
        lastName: "Carlick",
        mobile: "685-500-0168",
        imagePath: "/img/blog/details/details-author.jpg",
      },
      {
        email: "fochiltree2@nytimes.com",
        password: "x1Q3NnKVg5oB",
        firstName: "Frederich",
        lastName: "Ochiltree",
        mobile: "387-491-7478",
        imagePath: "/img/blog/details/details-author.jpg",
        isAdmin: true,
      },     
    ];
    // dung de tao ngay gio cho user
    items.forEach((item) => {
      item.createdAt = Sequelize.literal("NOW()");
      item.updatedAt = Sequelize.literal("NOW()");
    });
    await queryInterface.bulkInsert("users", items, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
