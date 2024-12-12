const Permission = require('../models/permission.js');

const All_Permissions = [
  // User
  { code_name: 'can_view_dashboard', description: 'can view dashboard' },
  { code_name: 'can_view_admin_user', description: 'can view admin user' },
  { code_name: 'can_create_admin_user', description: 'can create admin user' },
  { code_name: 'can_update_admin_user', description: 'can update admin user' },
  { code_name: 'can_delete_admin_user', description: 'can delete admin user' },
  { code_name: 'can_change_profile', description: 'can change profile' },
  { code_name: 'can_change_password', description: 'can change password' },
  { code_name: 'can_view_users', description: 'can view users' },
  { code_name: 'can_remove_users', description: 'can remove users' },

  // Roles
  {
    code_name: 'can_view_roles',
    description: 'can view roles',
  },
  {
    code_name: 'can_create_role',
    description: 'can create role',
  },
  {
    code_name: 'can_update_role',
    description: 'can update role',
  },
  {
    code_name: 'can_delete_role',
    description: 'can delete role',
  },
  {
    code_name: 'can_view_permissions',
    description: 'can view permission',
  },

  // News

  {
    code_name: 'can_view_news',
    description: 'can view news',
  },

  {
    code_name: 'can_create_news',
    description: 'can create news',
  },

  {
    code_name: 'can_update_news',
    description: 'can update news',
  },

  {
    code_name: 'can_delete_news',
    description: 'can delete news',
  },

  // Events

  {
    code_name: 'can_view_events',
    description: 'can view events',
  },

  {
    code_name: 'can_create_events',
    description: 'can create events',
  },

  {
    code_name: 'can_update_events',
    description: 'can update events',
  },

  {
    code_name: 'can_delete_events',
    description: 'can delete events',
  },

  // Announcements

  {
    code_name: 'can_view_announcements',
    description: 'can view announcements',
  },

  {
    code_name: 'can_create_announcements',
    description: 'can create announcements',
  },

  {
    code_name: 'can_update_announcements',
    description: 'can update announcements',
  },

  {
    code_name: 'can_delete_announcements',
    description: 'can delete announcements',
  },

  //Items

  {
    code_name: 'can_view_items',
    description: 'can view items',
  },

  {
    code_name: 'can_create_items',
    description: 'can create items',
  },

  {
    code_name: 'can_update_items',
    description: 'can update items',
  },

  {
    code_name: 'can_delete_items',
    description: 'can delete items',
  },

  //Memorials

  {
    code_name: 'can_view_memorials',
    description: 'can view memorials',
  },

  {
    code_name: 'can_create_memorials',
    description: 'can create memorials',
  },

  {
    code_name: 'can_update_memorials',
    description: 'can update memorials',
  },

  {
    code_name: 'can_delete_memorials',
    description: 'can delete memorials',
  },

  //Transactions

  {
    code_name: 'can_view_transactions',
    description: 'can view transactions',
  },
];

const createPermission = async () => {
  console.log('Creating New Permissions...');
  All_Permissions.map(async (permission, index) => {
    const exist = await Permission.findOne({ code_name: permission.code_name });

    if (exist == null) {
      await Permission.create(permission);
      console.dir(
        `Permission Inserted Successfully --- ${permission.description}`,
        { colors: true }
      );
    } else {
      console.dir(`Permission Already Exists --- ${permission.description}`, {
        colors: false,
      });
    }
  });
};

module.exports = createPermission;
