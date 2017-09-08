(function ($) {
  'use strict'

  var table

  /****************************************
   * 
   * User Modal
   *
   ****************************************/
  var UserModal = new function () {
    this.$document = $(document)
    this.$tableBox = $('.s-table-box')
    this.$modal = $('#modal-create')
    this.$username = $('#txtCreateUserName')
    this.$password = $('#pwdCreatePassword')
    this.$password2 = $('#pwdCreatePassword2')

    this.getUserName = function () {
      return this.$username.val().trim()
    }

    this.setUserName = function (name) {
      this.$username.val(name)
    }

    this.getPassWord = function () {
      return this.$password.val()
    }

    this.setPassWord = function (password) {
      this.$password.val(password)
    }

    this.getPassWord2 = function () {
      return this.$password2.val()
    }

    this.setPassWord2 = function (password) {
      this.$password2.val(password)
    }

    this.isValid = function () {
      if (this.getUserName() === '') {
        showSnack('請輸入使用者帳號')
      } else if (this.getPassWord() !== this.getPassWord2()) {
        showSnack('請確認密碼輸入一致')
      } else if (this.getPassWord() === '') {
        showSnack('請輸入使用者密碼')
      } else {
        return true
      }

      return false
    }

    this.reset = function () {
      this.setUserName('')
      this.setPassWord('')
      this.setPassWord2('')
    }

    this.btnCreateClick = function (event) {
      var self = this

      self.reset()

      this.$modal.modal('toggle')
    }

    this.save = function () {
      var self = this

      if (self.isValid()) {
        var UserObject = CTF.createUser({
          Account: self.getUserName(),
          Password: self.getPassWord()
        })

        UserObject.Post().then(function () {
          var account = UserObject.getAccount()

          CTF.DataTable.addRow(table, ['', account, '', '', UserObject])

          self.$modal.modal('toggle')

          showSnack('成功建立使用者')
        }, function () {
          showSnack('無法建立使用者')
        })
      }
    }

    this.$tableBox.on('click', '.btn-create', this.btnCreateClick.bind(this))
    this.$modal.on('click', '.btn-save', this.save.bind(this))
  }

  /****************************************
   * 
   * Reset Password Modal
   *
   ****************************************/
  var ResetPasswordModal = new function () {
    this.$document = $(document)
    this.$tableBox = $('.s-table-box')
    this.$modal = $('#modal-reset-pwd')
    this.$oldPassword = $('#pwdOldPassword')
    this.$password = $('#pwdResetPassword')
    this.$password2 = $('#pwdResetPassword2')
    this.UserObject

    this.getOldPassWord = function () {
      return this.$oldPassword.val()
    }

    this.setOldPassWord = function (password) {
      return this.$oldPassword.val(password)
    }

    this.getPassWord = function () {
      return this.$password.val()
    }

    this.setPassWord = function (password) {
      return this.$password.val(password)
    }

    this.getPassWord2 = function () {
      return this.$password2.val()
    }

    this.setPassWord2 = function (password) {
      return this.$password2.val(password)
    }

    this.setData = function (userObject) {
      this.UserObject = userObject
    }

    this.isValid = function () {
      if (this.getOldPassWord() === '') {
        showSnack('請輸入舊密碼')
      } else if (this.getPassWord() !== this.getPassWord2()) {
        showSnack('請確認密碼輸入一致')
      } else if (this.getPassWord() === '') {
        showSnack('請輸入新密碼')
      } else {
        return true
      }

      return false
    }

    this.reset = function () {
      this.setPassWord('')
      this.setPassWord2('')
      this.setOldPassWord('')
    }

    this.btnResetPwdClick = function (event) {
      var self = this
      var $row = $(event.target).parents('tr')
      var UserObject = $row.data('User')

      self.reset()
      self.setData(UserObject)

      self.$modal.modal('toggle')
    }

    this.save = function () {
      var self = this

      if (self.isValid()) {
        self.UserObject.PutPassword({
          OldPassword: self.getOldPassWord(),
          NewPassword: self.getPassWord()
        }).then(function (res) {
          var row = table.row('#' + self.UserObject.getId())
          var $row = $(row.node())

          self.UserObject.setPassword(self.getPassWord())

          $row.data('User', self.UserObject)

          self.$modal.modal('toggle')

          showSnack('成功更新使用者')
        }, function () {
          showSnack('無法更新使用者')
        })
      }
    }

    this.$tableBox.on('click', '.btn-reset-pwd', this.btnResetPwdClick.bind(this))
    this.$modal.on('click', '.btn-save', this.save.bind(this))
  }

  /****************************************
   * 
   * Delete Modal
   *
   ****************************************/
  var DeleteModal = new function () {
    this.$document = $(document)
    this.$tableBox = $('.s-table-box')
    this.$modal = $('#modal-delete')
    this.UserObject

    this.setData = function (userObject) {
      this.UserObject = userObject
    }

    this.btnDeleteClick = function (event) {
      var self = this
      var $row = $(event.target).parents('tr')

      self.setData($row.data('User'))

      self.$modal.modal('toggle')
    }

    this.save = function () {
      var self = this

      self.UserObject.Delete().then(function (res) {
        var row = table.row('#' + self.UserObject.getId())

        row.remove().draw(false)

        self.$modal.modal('toggle')

        showSnack('成功刪除使用者')
      }, function () {
        showSnack('無法刪除使用者')
      })
    }

    this.$tableBox.on('click', '.btn-delete', this.btnDeleteClick.bind(this))
    this.$modal.on('click', '.btn-save', this.save.bind(this))
  }

  /****************************************
   * 
   * Role Modal
   *
   ****************************************/
  var RoleModal = new function () {
    this.$document = $(document)
    this.$tableBox = $('.s-table-box')
    this.$modal = $('#modal-role')
    this.UserObject

    this.setData = function (userObject) {
      this.UserObject = userObject
    }

    this.btnRoleClick = function (event) {
      var self = this
      var $row = $(event.target).parents('tr')

      self.setData($row.data('User'))
      self.generateRoleItems()

      self.$modal.modal('toggle')
    }

    this.btnRoleItemClick = function (event) {
      var $item = $(event.target)
      var Role = $item.data('Role')

      if ($item.hasClass('btn-primary')) {
        $item.removeClass('btn-primary').addClass('btn-default')
      } else {
        $item.removeClass('btn-default').addClass('btn-primary')
      }
    }

    this.generateRoleItems = function () {
      var self = this

      var $formGroup = self.$modal.find('.modal-body .form-group').html('')

      CTF.Common.Roles.forEach(function (role, roleIdx) {
        var RoleObject = CTF.createRole(role)
        var roles = self.UserObject.getRoles()
        var result = roles.find(function (userRole, userRoleIdx) {
          return userRole.Id === RoleObject.getId()
        })
        var itemClass = result ? 'btn-primary' : 'btn-default'
        var $item =
          $('<div class="col-sm-6">' +
            '  <button type="button" class="btn btn-block ' + itemClass + ' btn-role-item">' + role.Name + '</button>' +
            '</div>')
        $('.btn-role-item', $item).data('Role', RoleObject)

        $formGroup.append($item)
      })
    }

    this.save = function () {
      var self = this
      var RoleObjects = []

      self.$modal.find('.btn-role-item').each(function (itemIdx, item) {
        var $item = $(item)
        var RoleObject = $item.data('Role')

        if ($item.hasClass('btn-primary')) {
          RoleObjects.push(RoleObject)
        }
      })

      self.UserObject.PatchRoles({
        RoleIdList: RoleObjects.map(function (RoleObject, roleObjectIdx) {
          return RoleObject.getId()
        })
      }).then(function (res) {
        var row = table.row('#' + self.UserObject.getId())
        var $row = $(row.node())

        self.UserObject.setRoles(RoleObjects.map(function (RoleObject, roleObjectIdx) {
          return RoleObject.Get()
        }))

        row.cell(row.index(), 2).data(self.UserObject.getRolesString()).draw(false)

        self.$modal.modal('toggle')

        showSnack('成功更新使用者')
      }, function () {
        showSnack('無法更新使用者')
      })
    }

    this.$tableBox.on('click', '.btn-role', this.btnRoleClick.bind(this))
    this.$modal.on('click', '.btn-save', this.save.bind(this))
    this.$modal.on('click', '.btn-role-item', this.btnRoleItemClick.bind(this))
  }

  /****************************************
   * 
   * Init DataTable
   *
   ****************************************/
  function initDataTable() {
    var API = CTF.API
    var DataTable = CTF.DataTable

    API.getUsers().then(function (res) {
      var data = res.map(function (user, userIdx) {
        var UserObject = CTF.createUser(user)
        var userName = UserObject.getAccount()
        var rolesString = UserObject.getRolesString()

        return ['', userName, rolesString, '', UserObject]
      })

      table = DataTable.create('#table', {
        "data": data,
        "columns": [
          { "title": '編號' },
          { "title": '帳號' },
          { "title": '角色' },
          { "title": '' }
        ],
        "createdRow": function (row, data, dataIndex) {
          var UserObject = data[data.length - 1]
          var userId = UserObject.getId()

          $(row).attr('id', userId).data('User', UserObject)
        },
        "columnDefs": [{
          "targets": 0
        }, {
          "targets": 3,
          "width": 300,
          "createdCell": function (td, cellData, rowData, row, col) {
            td.innerHTML =
              '<div class="actions">' +
              '  <button type="button" class="btn btn-default btn-reset-pwd">重設密碼</button>' +
              '  <button type="button" class="btn btn-default btn-role">角色</button>' +
              '  <button type="button" class="btn btn-default btn-delete">刪除</button>' +
              '</div>'
          }
        }],
        "initComplete": function (settings, json) {
          DataTable.drawSerialNumber(this.api())
        }
      })
    }, function () {
      showSnack('無法取得使用者資料')
    })
  }

  /****************************************
   * 
   * Main Process
   *
   ****************************************/
  initDataTable()
})(jQuery)