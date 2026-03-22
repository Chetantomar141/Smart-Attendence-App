export default (sequelize, Sequelize) => {
  const Fee = sequelize.define("fee", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    total: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    paid: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    miscellaneous: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    transport: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    remaining: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.total - this.paid;
      }
    },
    status: {
      type: Sequelize.ENUM('Paid', 'Pending'),
      defaultValue: 'Pending'
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Fee;
};
