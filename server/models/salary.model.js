export default (sequelize, Sequelize) => {
  const Salary = sequelize.define("salary", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    amount: {
      type: Sequelize.DOUBLE,
      allowNull: false
    },
    month: {
      type: Sequelize.STRING,
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('Paid', 'Pending'),
      defaultValue: 'Pending'
    },
    paymentDate: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  return Salary;
};
