export default (sequelize, Sequelize) => {
  const Expense = sequelize.define("expense", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  return Expense;
};
