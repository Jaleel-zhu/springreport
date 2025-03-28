export default {
  name: 'sysRole',
  data() {
    return {
      tableLoading: true,
      pageData: {
        //查询表单内容 start
        searchForm: [
          { type: 'Input', label: '角色代码', prop: 'roleCode' },
          { type: 'Input', label: '角色名称', prop: 'roleName' },
        ],
        //查询表单内容 end
        //查询条件 start
        queryData: {
          roleCode: '', //角色代码
          roleName: '', //角色名称
        },
        //查询条件 end
        //查询表单按钮start
        searchHandle: [
          {
            label: '查询',
            type: 'primary',
            handle: () => this.searchtablelist(),
            auth: 'sysRole_search',
          },
          {
            label: '清除条件',
            type: '',
            handle: () => this.resetSearch(),
            auth: 'sysRole_search',
          },
        ],
        //查询表单按钮end
        //表格数据start
        tableData: [],
        //表格数据end
        //表格工具栏按钮 start
        tableHandles: [
          {
            label: '新增',
            type: 'primary',
            position: 'right',
            iconClass: 'action-icon-add',
            handle: () => this.showModal(this.commonConstants.modalType.insert),
            auth: 'sysRole_insert',
          },
          {
            label: '批量删除',
            type: 'danger',
            position: 'left',
            iconClass: 'action-icon-del',
            handle: () => this.deleteBatch(),
            auth: 'sysRole_batchDelete',
          },
        ],
        //表格工具栏按钮 end
        selectList: [], //表格选中的数据
        //表格分页信息start
        tablePage: {
          currentPage: 1,
          pageSize: 10,
          pageTotal: 0,
          pageSizeRange: [5, 10, 20, 50],
        },
        //表格分页信息end
        //表格列表头start
        tableCols: [
          {
            label: '操作',
            prop: 'operation',
            align: 'center',
            type: 'dropdown',
            width: 54,
            btnList: [
              {
                label: '查看',
                type: 'primary',
                auth: 'sysRole_getDetail',
                handle: (row) => this.showModal(this.commonConstants.modalType.detail, row.id),
              },
              {
                label: '编辑',
                type: 'primary',
                auth: 'sysRole_update',
                handle: (row) => this.showModal(this.commonConstants.modalType.update, row.id),
              },
              {
                label: '功能权限',
                type: 'primary',
                auth: 'sysRole_authed',
                handle: (row) => this.showAuthModal(row.id),
              },
              {
                label: '报表权限',
                type: 'primary',
                auth: 'sysRole_reportAuth',
                handle: (row) => this.showReportAuthModal(row.id),
              },
              {
                label: '删除',
                type: 'danger',
                auth: 'sysRole_delete',
                handle: (row) => this.deleteOne(row.id),
              },
            ],
          },
          { label: '角色代码', prop: 'roleCode', align: 'center', overflow: true },
          { label: '角色名称', prop: 'roleName', align: 'center', overflow: true },
          { label: '角色描述', prop: 'roleDesc', align: 'center', overflow: true },
        ],
        //表格列表头end
        //modal配置 start
        modalConfig: {
          title: '新增', //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled: false, //编辑弹窗是否可编辑
          width: '700px', //弹出框宽度
          modalRef: 'modalRef', //modal标识
          type: '1', //类型 1新增 2编辑 3保存
        },
        //modal配置 end
        //modal表单 start
        modalForm: [
          {
            type: 'Input',
            label: '角色代码',
            prop: 'roleCode',
            rules: { required: true, maxLength: 20 },
          },
          {
            type: 'Input',
            label: '角色名称',
            prop: 'roleName',
            rules: { required: true, maxLength: 40 },
          },
          {
            type: 'Input',
            label: '角色描述',
            prop: 'roleDesc',
            rules: { required: true, maxLength: 100 },
          },
        ],
        //modal表单 end
        //modal 数据 start
        modalData: {
          //modal页面数据
          merchantNo: '', //商户号
          roleCode: '', //角色代码
          roleName: '', //角色名称
          roleDesc: '', //角色描述
          updater: '', //更新人
        },
        //modal 数据 end
        //modal 按钮 start
        modalHandles: [
          { label: '取消', type: 'default', handle: () => this.closeModal() },
          { label: '提交', type: 'primary', handle: () => this.save() },
        ],
        //modal 按钮 end
        //授权页面配置 start
        authDialogParam: {
          //modal页面标题、是否显示等参数
          title: '权限配置', //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示,
          type: '1',
        },
        authModalForm: [
          {
            type: 'Tree',
            data: [],
            checked: [],
            props: { children: 'children', label: 'menuName' },
            key: 'menuId',
            ref: 'authTree',
          },
        ],
        authModalHandles: [
          { label: '取消', type: 'default', handle: () => this.closeAuthModal() },
          { label: '提交', type: 'primary', handle: () => this.auth() },
        ],
        authModalData: {
          roleId: '', //角色id
          authed: [], //已授权的数据
        },
        //授权页面配置end
        //报表授权页面配置 start
        reportAuthDialogParam: {
          //modal页面标题、是否显示等参数
          title: '权限配置', //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示,
          type: '1',
        },
        reportAuthModalForm: [
          {
            type: 'Tree',
            data: [],
            checked: [],
            props: { children: 'children', label: 'reportName' },
            key: 'reportId',
            ref: 'reportAuthTree',
          },
        ],
        reportAuthModalHandles: [
          { label: '取消', type: 'default', handle: () => this.closeReportAuthModal() },
          { label: '提交', type: 'primary', handle: () => this.authReport() },
        ],
        reportAuthModalData: {
          roleId: '', //角色id
          authed: [], //已授权的数据
        },
        //报表授权页面配置end
      },
    };
  },
  mounted() {
    this.pageData.tableData = [];
    this.searchtablelist();
  },
  methods: {
    /**
     * @description: 获取表格数据
     * @param {type}
     * @return:
     * @author: caiyang
     */
    searchtablelist() {
      this.tableLoading = true;
      var obj = {
        url: this.apis.sysRole.listApi,
        params: Object.assign({}, this.pageData.queryData, this.pageData.tablePage),
      };
      this.commonUtil.getTableList(obj).then((response) => {
        this.commonUtil.tableAssignment(response, this.pageData.tablePage, this.pageData.tableData);
        this.tableLoading = false;
      });
    },
    resetSearch() {
      this.commonUtil.clearObj(this.pageData.queryData);
      this.searchtablelist();
    },
    /**
     * @description: modal显示
     * @param {type} 类型 1新增，2编辑 3详情
     * @param {id} 数据唯一标识
     * @return:
     * @author: caiyang
     */
    showModal(type, id) {
      this.commonUtil.showModal(this.pageData.modalConfig, type);
      if (type != this.commonConstants.modalType.insert) {
        this.getDetail(id);
      }
    },
    /**
     * @description: 获取详细数据
     * @param {id} 数据唯一标识
     * @return:
     * @author: caiyang
     */
    getDetail(id) {
      var obj = {
        url: this.apis.sysRole.getDetailApi,
        params: { id: id },
      };
      this.commonUtil.doGet(obj).then((response) => {
        this.commonUtil.coperyProperties(this.pageData.modalData, response.responseData); //数据赋值
      });
    },
    /**
     * @description: 关闭modal
     * @param
     * @return:
     * @author: caiyang
     */
    closeModal() {
      this.$refs['modalRef'].$refs['modalFormRef'].resetFields(); //校验重置
      this.pageData.modalConfig.show = false; //关闭modal
      this.commonUtil.clearObj(this.pageData.modalData); //清空modalData
    },
    /**
     * @description: 保存数据
     * @param {type}
     * @return:
     * @author: caiyang
     */
    save() {
      this.$refs['modalRef'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
          var obj = {
            params: this.pageData.modalData,
            removeEmpty: false,
          };
          if (this.pageData.modalConfig.type == this.commonConstants.modalType.insert) {
            obj.url = this.apis.sysRole.insertApi;
          } else {
            obj.url = this.apis.sysRole.updateApi;
          }
          this.commonUtil.doPost(obj).then((response) => {
            if (response.code == '200') {
              this.closeModal();
              this.searchtablelist();
            }
          });
        } else {
          return false;
        }
      });
    },
    /**
     * @description: 删除一条数据
     * @param {id} 数据唯一标识
     * @return:
     * @author: caiyang
     */
    deleteOne(id) {
      let obj = {
        url: this.apis.sysRole.deleteOneApi,
        messageContent: this.commonUtil.getMessageFromList('confirm.delete', null),
        callback: this.searchtablelist,
        params: { id: id },
        type: 'get',
      };
      //弹出删除确认框
      this.commonUtil.showConfirm(obj);
    },
    /**
     * @description: 批量删除
     * @param {type}
     * @return:
     * @author: caiyang
     */
    deleteBatch() {
      const length = this.pageData.selectList.length;
      if (length == 0) {
        this.commonUtil.showMessage({
          message: this.commonUtil.getMessageFromList('error.batchdelete.empty', null),
          type: this.commonConstants.messageType.error,
        });
      } else {
        let ids = new Array();
        for (let i = 0; i < length; i++) {
          ids.push(this.pageData.selectList[i].id);
        }
        let obj = {
          url: this.apis.sysRole.deleteBatchApi,
          messageContent: this.commonUtil.getMessageFromList('confirm.delete', null),
          callback: this.searchtablelist,
          params: ids,
          type: 'post',
        };
        this.commonUtil.showConfirm(obj);
      }
    },
    selectChange(rows) {
      this.pageData.selectList = rows;
    },
    showAuthModal(id) {
      //显示权限配置页面
      this.pageData.authDialogParam.show = true; //显示弹框
      this.pageData.authModalData.roleId = id;
      this.getAuthTree(id); //获取权限树
    },
    //获取权限树
    getAuthTree(id) {
      var obj = {
        params: { id: id },
        removeEmpty: false,
        url: this.apis.sysRole.getAuthTreeApi,
      };
      this.commonUtil.doPost(obj).then((response) => {
        if (response.code == '200') {
          this.pageData.authModalForm[0].data = response.responseData.treeData;
          this.pageData.authModalForm[0].checked = response.responseData.authed;
        }
      });
    },
    auth() {
      //确定授权
      var checkedNodes = this.$refs.authRef.$refs.authTree[0].getCheckedNodes(false, true);
      if (checkedNodes && checkedNodes.length > 0) {
        for (let index = 0; index < checkedNodes.length; index++) {
          this.pageData.authModalData.authed.push(checkedNodes[index].menuId);
        }
      }
      var obj = {
        url: this.apis.sysRole.authApi,
        params: this.pageData.authModalData,
        removeEmpty: false,
      };
      this.commonUtil.doPost(obj).then((response) => {
        this.closeAuthModal();
      });
    },
    closeAuthModal() {
      //关闭权限配置页面
      this.pageData.authDialogParam.show = false; //关闭弹框
      this.pageData.authModalForm[0].data = [];
      this.pageData.authModalForm[0].checked = [];
      this.pageData.authModalData.authed = [];
    },
    showReportAuthModal(id) {
      this.pageData.reportAuthDialogParam.show = true; //显示弹框
      this.pageData.reportAuthModalData.roleId = id;
      this.getReportAuthTree(id); //获取权限树
    },
    getReportAuthTree(id) {
      var obj = {
        params: { roleId: id },
        removeEmpty: false,
        url: this.apis.sysRole.getReportTreeApi,
      };
      this.commonUtil.doPost(obj).then((response) => {
        if (response.code == '200') {
          this.pageData.reportAuthModalForm[0].data = response.responseData.treeData;
          this.pageData.reportAuthModalForm[0].checked = response.responseData.authed;
        }
      });
    },
    authReport() {
      //确定授权
      var checkedNodes = this.$refs.reportAuthRef.$refs.reportAuthTree[0].getCheckedNodes(
        false,
        true
      );
      if (checkedNodes && checkedNodes.length > 0) {
        for (let index = 0; index < checkedNodes.length; index++) {
          this.pageData.reportAuthModalData.authed.push(checkedNodes[index].reportId);
        }
      }
      var obj = {
        url: this.apis.sysRole.reportAuthApi,
        params: this.pageData.reportAuthModalData,
        removeEmpty: false,
      };
      this.commonUtil.doPost(obj).then((response) => {
        this.closeReportAuthModal();
      });
    },
    closeReportAuthModal() {
      //关闭权限配置页面
      this.pageData.reportAuthDialogParam.show = false; //关闭弹框
      this.pageData.reportAuthModalForm[0].data = [];
      this.pageData.reportAuthModalForm[0].checked = [];
      this.pageData.reportAuthModalData.authed = [];
    },
  },
};
