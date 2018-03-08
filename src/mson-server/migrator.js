import SequelizeExtras from './sequelize-extras';
import { sequelize, User, Employee, Email, Department } from './connectors';

const url = 'mysql://root:secret@localhost:3306';
const db = new SequelizeExtras(url);
const dbName = 'tmp';

class Migrator {
  async _createModels() {
    await sequelize.sync();
  }

  async _seed() {
    let bizDep = await Department.create({
      name: 'Business Development'
    });

    let muscleDep = await Department.create({
      name: 'Muscle'
    });

    let thomasUser = await User.create({
      firstName: 'Thomas',
      lastName: 'Shelby'
    });

    // TODO: possible to not have to use createEmployee and can pass model name instead?
    let thomasEmployee = await thomasUser.createEmployee(
      {
        firstName: 'Thomas',
        lastName: 'Shelby',
        emails: [
          {
            email: 'thomas1@example.com'
          },
          {
            email: 'thomas2@example.com'
          }
        ]
      },
      {
        include: [Email]
      }
    );

    await thomasEmployee.addDepartments([bizDep, muscleDep]);

    let arthurUser = await User.create();

    let arthurEmployee = await arthurUser.createEmployee(
      {
        firstName: 'Arthur',
        lastName: 'Shelby',
        emails: [
          {
            email: 'arthur1@example.com'
          }
        ]
      },
      {
        include: [Email]
      }
    );

    await arthurEmployee.addDepartment(muscleDep);
  }

  async up() {
    await db.create(dbName);
    await db.close();

    await this._createModels();

    await this._seed();

    await sequelize.close();
  }

  async down() {
    await db.destroy(dbName);
    await db.close();
  }
}

export default new Migrator();
