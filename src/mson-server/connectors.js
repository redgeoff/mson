const Sequelize = require('sequelize');
const { resolver } = require('graphql-sequelize')

const url = 'mysql://root:secret@localhost:3306';
const dbName = 'tmp';

const sequelize = new Sequelize(url + '/' + dbName)

const User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
})

const Employee = sequelize.define('employee', {
  firstName: {
    type: Sequelize.STRING(40)
  },
  lastName: {
    type: Sequelize.STRING(40)
  }
})

const Email = sequelize.define('email', {
  email: {
    type: Sequelize.STRING(50)
  }
})

const Department = sequelize.define('department', {
  name: {
    type: Sequelize.STRING(80)
  }
})

User.hasOne(Employee)
Employee.belongsTo(User)

Department.belongsToMany(Employee, { through: 'employeeDepartment' })
Employee.belongsToMany(Department, { through: 'employeeDepartment' })

Employee.hasMany(Email)
// Email.belongsTo(Employee)

// Wrap so that requests are batched via dataloader
resolver(User)
resolver(Employee)
resolver(Email)
resolver(Department)

module.exports = { sequelize, User, Employee, Email, Department }
