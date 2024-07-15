export default {
  name:'reportTpl',
  data() {
    return{
      pageData:{
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        treeData:[],
        //查询表单内容 start
        searchForm:[
					{type:'Input',label:'报表标识',prop:'tplCode'},
          {type:'Input',label:'报表名称',prop:'tplName'},
          // {type:'Select',label:'报表类型',prop:'reportType',props:{label:"reportTypeName",value:"id"}},
        ],
        //查询表单内容 end
        //查询条件 start
        queryData:{
					tplCode:"",//模板标识 
          tplName:"",//模板名称
          reportType:"",//报表类型
        },
        //查询条件 end
        //查询表单按钮start
        searchHandle:[
          {label:'查询',type:'primary',handle:()=>this.searchtablelist(),auth:'reportTpl_search'},
          {label:'重置',type:'warning',handle:()=>this.resetSearch(),auth:'reportTpl_search'}
        ],
        //查询表单按钮end
        //表格数据start
        tableData:[],
        //表格数据end
        //表格工具栏按钮 start
        tableHandles:[
          {label:'新增',type:'primary',handle:()=>this.showModal(this.commonConstants.modalType.insert),auth:'reportTpl_insert'},
          {label:'批量删除',type:'danger',handle:()=>this.deleteBatch(),auth:'reportTpl_batchDelete'}
        ],
        //表格工具栏按钮 end
        selectList:[],//表格选中的数据
        //表格分页信息start
        tablePage:{
          currentPage: 1,
          pageSize:10,
          pageTotal: 0,
          pageSizeRange:[5, 10, 20, 50]
        },
        //表格分页信息end
        //表格列表头start
        tableCols:[
					{label:'报表标识',prop:'tplCode',align:'center',overflow:true},
          {label:'报表名称',prop:'tplName',align:'center',overflow:true},
          {label:'报表分类',prop:'reportTypeName',align:'center',overflow:true},
          {label:'查看权限',prop:'viewAuth',align:'center',codeType:'viewAuth',formatter:this.commonUtil.getTableCodeName,overflow:true},
          {label:'数据源代码',prop:'dataSourceCode',align:'center',overflow:true},
          {label:'数据源名称',prop:'dataSourceName',align:'center',overflow:true},
          {label:'导出是否加密',prop:'exportEncrypt',align:'center',codeType:'yesNo',formatter:this.commonUtil.getTableCodeName,overflow:true},
          {label:'报表类型',prop:'tplType',align:'center',codeType:'tplType',formatter:this.commonUtil.getTableCodeName,overflow:true},
					{label:'操作',prop:'operation',align:'center',type:'button',width:400,btnList:[
						{label:'查看',type:'text',auth:'reportTpl_getDetail',handle:(row)=>this.showModal(this.commonConstants.modalType.detail,row.id)},
						{label:'编辑',type:'text',auth:'reportTpl_update',handle:(row)=>this.showModal(this.commonConstants.modalType.update,row.id)},
            {label:'删除',type:'text',auth:'reportTpl_delete',handle:(row)=>this.deleteOne(row.id)},
            {label:'复制',type:'text',auth:'reportTpl_copy',handle:(row)=>this.copyReport(row)},
            {label:'报表设计',type:'text',auth:'reportTpl_reportDesign',handle:(row)=>this.routerTo(row.tplType == '1'?'luckyReportDesign':'luckyReportFroms',row)},
            {label:'修改密码',type:'text',auth:'reportTpl_changePwd',show:(row)=>this.isShowChangePwd(row),handle:(row)=>this.showChangePwd(row)},
            {label:'报表查看(pc)',type:'text',auth:'reportTpl_reportView',handle:(row)=>this.routerTo("luckyReportPreview",row)},
            {label:'报表查看(手机)',type:'text',auth:'reportTpl_reportView',show:(row)=>this.isShowShare(row),handle:(row)=>this.routerTo('h5ReportPreview',row)},
            {label:'报表分享',type:'text',auth:'reportTpl_reportShare',handle:(row)=>this.showShareReport(row)},
            {label:'定时任务',type:'text',auth:'reportTpl_Task',show:(row)=>this.isShowShare(row),handle:(row)=>this.routerToTask(row)},
					]}
        ],
        //表格列表头end
        //modal配置 start
        modalConfig:{ 
          title: "新增", //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled:false,//编辑弹窗是否可编辑
          width:'800px',//弹出框宽度
          modalRef:"modalRef",//modal标识
          type:"1"//类型 1新增 2编辑 3保存
        },
        //modal配置 end
        //modal表单 start
        modalForm:[
					{type:'Input',label:'报表标识',prop:'tplCode',rules:{required:true,maxLength:40}},
          {type:'Input',label:'报表名称',prop:'tplName',rules:{required:true,maxLength:40}},
          {type:'Select',label:'报表分类',prop:'reportType',rules:{required:true},props:{label:"reportTypeName",value:"id"}},
          {type:'Select',label:'报表数据源',prop:'dataSource',rules:{required:true},multiple:true,props:{label:"code",value:"id"}},
          {type:'Select',label:'查看权限',prop:'viewAuth',rules:{required:true},options:this.selectUtil.viewAuth,change:this.changeViewAuth},
          // {type:'Select',label:'角色配置',prop:'roles',rules:{required:false},multiple:true,width:'520px',props:{label:"roleName",value:"id"}},
          {type:'Password',label:'设计密码',prop:'designPwd',rules:{required:false,maxLength:32}},
          {type:'Select',label:'导出是否加密',prop:'exportEncrypt',rules:{required:true},options:this.selectUtil.yesNo},
          {type:'Select',label:'报表类型',prop:'tplType',rules:{required:true},multiple:false,options:this.selectUtil.tplType,change:this.changeTplType},
          {type:'Select',label:'是否并发控制',prop:'concurrencyFlag',rules:{required:true},multiple:false,options:this.selectUtil.yesNo},
          {type:'Select',label:'提交后是否刷新页面',prop:'refreshPage',rules:{required:true},multiple:false,options:this.selectUtil.yesNo},
          {type:'Select',label:'工具栏预览是否展示',prop:'showToolbar',rules:{required:true},options:this.selectUtil.yesNo},
          {type:'Select',label:'行标题预览是否展示',prop:'showRowHeader',rules:{required:true},options:this.selectUtil.yesNo},
          {type:'Select',label:'列标题预览是否展示',prop:'showColHeader',rules:{required:true},options:this.selectUtil.yesNo},
          {type:'Select',label:'网格线预览是否展示',prop:'showGridlines',rules:{required:true},options:this.selectUtil.yesNo},
          {type:'Select',label:'是否开启协同',prop:'coeditFlag',rules:{required:true},options:this.selectUtil.yesNo},
        ],
        //modal表单 end
        //modal 数据 start
        modalData : {//modal页面数据
					tplCode:"",//模板标识 
          tplName:"",//模板名称 
          reportType:"",//报表类型
          dataSource:[],//报表数据源
          viewAuth:"",//查看权限 1所有人可见 2指定角色
          designPwd:"",//设计密码
          exportEncrypt:"",//导出时是否加密
          refreshPage:"",
          tplType:"",//报表类型 1展示报表 2填报报表
          roles:[],//角色
          concurrencyFlag:1,
          showToolbar:2,
          showRowHeader:1,
          showColHeader:1,
          showGridlines:1,
          coeditFlag:1,
        },
        //modal 数据 end
        //modal 按钮 start
        modalHandles:[
          {label:'取消',type:'default',handle:()=>this.closeModal()},
          {label:'提交',type:'primary',handle:()=>this.save()}
        ],
        //modal 按钮 end
        changePwdConfig:{ 
          title: "修改密码", //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled:false,//编辑弹窗是否可编辑
          width:'700px',//弹出框宽度
          modalRef:"modalRef",//modal标识
          type:"1"//类型 1新增 2编辑 3保存
        },
        changePwdForm:[
					{type:'Password',label:'旧密码',prop:'oldPwd',rules:{required:true,maxLength:32}},
          {type:'Password',label:'新密码',prop:'designPwd',rules:{required:false,maxLength:32}},
        ],
        //modal表单 end
        //modal 数据 start
        changePwdModalData : {//modal页面数据
          id:null,
					oldPwd:"",//模板标识 
          designPwd:"",//模板名称 
        },
        //modal 数据 end
        //modal 按钮 start
        changePwdModalHandles:[
          {label:'取消',type:'default',handle:()=>this.closePwdModal()},
          {label:'提交',type:'primary',handle:()=>this.changePwd()}
        ],
        //modal配置 start
        copyModalConfig:{ 
          title: "复制模板", //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled:false,//编辑弹窗是否可编辑
          width:'700px',//弹出框宽度
          modalRef:"modalRef",//modal标识
          type:"1"//类型 1新增 2编辑 3保存
        },
        //modal配置 end
        //modal表单 start
        copyModalForm:[
					{type:'Input',label:'报表标识',prop:'tplCode',rules:{required:true,maxLength:40}},
          {type:'Input',label:'报表名称',prop:'tplName',rules:{required:true,maxLength:40}},
          {type:'Select',label:'报表类型',prop:'reportType',rules:{required:true},props:{label:"reportTypeName",value:"id"}},
          {type:'Select',label:'报表数据源',prop:'dataSource',disabled:this.commonUtil.disabled,rules:{required:true},multiple:true,props:{label:"code",value:"id"}},
          {type:'Select',label:'查看权限',prop:'viewAuth',rules:{required:true},options:this.selectUtil.viewAuth,change:this.changeViewAuth},
          // {type:'Select',label:'角色配置',prop:'roles',rules:{required:false},multiple:true,width:'520px',props:{label:"roleName",value:"id"}},
          {type:'Password',label:'设计密码',prop:'designPwd',rules:{required:false,maxLength:32}},
          {type:'Select',label:'导出是否加密',prop:'exportEncrypt',rules:{required:true},options:this.selectUtil.yesNo},
          {type:'Select',label:'报表类型',prop:'tplType',rules:{required:true},multiple:false,options:this.selectUtil.tplType},
        ],
        //modal表单 end
        //modal 数据 start
        copyModalData : {//modal页面数据
					tplCode:"",//模板标识 
          tplName:"",//模板名称 
          reportType:"",//报表类型
          dataSource:[],//报表数据源
          viewAuth:"",//查看权限 1所有人可见 2指定角色
          designPwd:"",//设计密码
          exportEncrypt:"",//导出时是否加密
          tplType:"",//报表类型 1展示报表 2填报报表
          roles:[],//角色
        },
        //modal 数据 end
        //modal 按钮 start
        copyModalHandles:[
          {label:'取消',type:'default',handle:()=>this.closeCopyModal()},
          {label:'提交',type:'primary',handle:()=>this.doCopy()}
        ],

        shareReportConfig:{ 
          title: "报表分享", //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled:false,//编辑弹窗是否可编辑
          width:'700px',//弹出框宽度
          modalRef:"modalRef",//modal标识
          type:"1"//类型 1新增 2编辑 3保存
        },
        shareReportForm:[
					{type:'Input',label:'有效时长(分)',prop:'shareTime',rules:{required:true,type:"integer",min:1,max:120}},
          {type:'Select',label:'分享类型',prop:'shareType',rules:{required:true},options:this.selectUtil.shareType},
          {type:'Select',label:'允许上报数据',prop:'allowReport',rules:{required:true},options:this.selectUtil.yesNo},
        ],
        shareReportModalData : {//modal页面数据
          tplId:null,
					shareTime:"",//有效时长(分)
          shareType:"",//分享类型
          tplType:"1",//报表类型
          allowReport:2
        },
        shareReportModalHandles:[
          {label:'取消',type:'default',handle:()=>this.closeShareReportModal()},
          {label:'获取分享链接',type:'primary',handle:()=>this.getShareUrl()}
        ],
      }
    }
  },
  activated() {
    this.pageData.tableData = [];
    this.searchtablelist();
    this.getReportType();
    this.getReportDatasource();
    this.getReportTypeTree();
    // this.getRoles();
  },
  methods:{
    /**
     * @description: 获取表格数据
     * @param {type} 
     * @return: 
     * @author: caiyang
     */    
    searchtablelist(){
      var obj = {
        url:this.apis.reportTpl.listApi,
        params:Object.assign({}, this.pageData.queryData, this.pageData.tablePage),
      }
      this.commonUtil.getTableList(obj).then(response=>{
        this.commonUtil.tableAssignment(response,this.pageData.tablePage,this.pageData.tableData);
        this.$nextTick(() => {
          this.$refs.custable.$refs.cesTable.doLayout();
        });
      });
    },
    resetSearch(){
      var reportType = this.pageData.queryData.reportType;
      this.commonUtil.clearObj(this.pageData.queryData);
      this.pageData.queryData.reportType = reportType;
      this.searchtablelist();
    },
    /**
     * @description: modal显示
     * @param {type} 类型 1新增，2编辑 3详情 
     * @param {id} 数据唯一标识
     * @return: 
     * @author: caiyang
     */    
    showModal(type,id){
      this.commonUtil.showModal(this.pageData.modalConfig,type);
      if(type != this.commonConstants.modalType.insert)
      {
        this.getDetail(id);
      }else{
        this.pageData.modalForm[5].disabled = this.commonUtil.undisabled;
        this.showRoleSelect();
      }
      
    },
    /**
     * @description: 获取详细数据
     * @param {id} 数据唯一标识
     * @return: 
     * @author: caiyang
     */    
    getDetail(id){
      var obj = {
        url:this.apis.reportTpl.getDetailApi,
        params:{id:id},
      }
      this.commonUtil.doGet(obj).then(response=>{
        this.commonUtil.coperyProperties(this.pageData.modalData,response.responseData);//数据赋值
        if(this.pageData.modalData.designPwd)
        {
          this.pageData.modalForm[5].disabled = this.commonUtil.disabled;
        }else{
          this.pageData.modalForm[5].disabled = this.commonUtil.undisabled;
        }
        this.showRoleSelect();
        this.changeTplType();
      });
    },
    /**
     * @description: 关闭modal
     * @param 
     * @return: 
     * @author: caiyang
     */    
    closeModal(){
      this.$refs['modalRef'].$refs['modalFormRef'].resetFields();//校验重置
      this.pageData.modalConfig.show = false;//关闭modal
      this.commonUtil.clearObj(this.pageData.modalData);//清空modalData
    },
    /**
     * @description: 保存数据
     * @param {type} 
     * @return: 
     * @author: caiyang
     */    
    save(){
      this.$refs['modalRef'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
            var obj = {
              params:this.pageData.modalData,
              removeEmpty:false,
            }
            if(this.pageData.modalConfig.type == this.commonConstants.modalType.insert)
            {
              obj.url = this.apis.reportTpl.insertApi;
            }else{
              obj.url = this.apis.reportTpl.updateApi
            }
            this.commonUtil.doPost(obj) .then(response=>{
              if (response.code == "200")
              {
                this.closeModal();
                this.searchtablelist();
              }
            });
        }else{
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
    deleteOne(id){
      let obj = {
        url:this.apis.reportTpl.deleteOneApi,
        messageContent:this.commonUtil.getMessageFromList("confirm.delete",null),
        callback:this.searchtablelist,
        params:{id:id},
        type:"get",
      }
      //弹出删除确认框
      this.commonUtil.showConfirm(obj)
    },
    /**
     * @description: 批量删除
     * @param {type} 
     * @return: 
     * @author: caiyang
     */    
    deleteBatch(){
        const length = this.pageData.selectList.length;
        if(length == 0)
        {
            this.commonUtil.showMessage({message:this.commonUtil.getMessageFromList("error.batchdelete.empty",null),type: this.commonConstants.messageType.error});
        }else{
          let ids = new Array();
          for (let i = 0; i < length; i++) {
              ids.push(this.pageData.selectList[i].id);
          }
          let obj = {
            url:this.apis.reportTpl.deleteBatchApi,
            messageContent:this.commonUtil.getMessageFromList("confirm.delete",null),
            callback:this.searchtablelist,
            params:ids,
            type:"post",
          }
          this.commonUtil.showConfirm(obj);
        }
    },
    selectChange(rows){
      this.pageData.selectList = rows;
    },
    //获取报表类型
    getReportType(){
      var obj = {
        params:{},
        url:this.apis.reportType.getReportTypeApi
      }
      this.commonUtil.doPost(obj) .then(response=>{
        if (response.code == "200")
        {
          this.pageData.modalForm[2].options = response.responseData;
          this.pageData.copyModalForm[2].options = response.responseData;
          // this.pageData.searchForm[2].options = response.responseData;
          this.$refs['searchRef'].$forceUpdate();
        }
      });
    },
    //获取数据源
    getReportDatasource(){
      var obj = {
        params:{},
        url:this.apis.reportDatasource.getReportDatasourceApi
      }
      this.commonUtil.doPost(obj) .then(response=>{
        if (response.code == "200")
        {
          this.pageData.modalForm[3].options = response.responseData;
          this.pageData.copyModalForm[3].options = response.responseData;
        }
      });
    },
    //页面跳转
    routerTo(name,row){
      let viewReport = this.$router.resolve({ name:name,query: {tplId:row.id}});
      window.open(viewReport.href, '_blank');
    },
    //是否显示修改密码按钮
    isShowChangePwd(row){
      if(row.designPwd)
      {
        return true
      }else{
        return false
      }
    },
    showChangePwd(row){
      this.pageData.changePwdConfig.show = true;
      this.pageData.changePwdModalData.id = row.id;
    },
    changePwd(){
      this.$refs['changePwd'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
            var obj = {
              params:this.pageData.changePwdModalData,
              removeEmpty:false,
            }
            obj.url = this.apis.reportTpl.changeDesignPwdApi;
            this.commonUtil.doPost(obj) .then(response=>{
              if (response.code == "200")
              {
                this.closePwdModal();
                this.searchtablelist();
              }
            });
        }else{
            return false;
        }
      });
    },
    closePwdModal(){
      this.$refs['changePwd'].$refs['modalFormRef'].resetFields();//校验重置
      this.pageData.changePwdConfig.show = false;;//关闭modal
      this.commonUtil.clearObj(this.pageData.changePwdModalData);//清空modalData
      this.pageData.changePwdModalData.designPwd = "";
    },
    changeViewAuth(){
      this.showRoleSelect();
    },
    showRoleSelect(){
      if(this.pageData.modalData.viewAuth == '2')
      {
        // this.pageData.modalForm[5].show = true
      }else{
        // this.pageData.modalForm[5].show = false
      }
    },
    getRoles(){
      var obj = {
        params:{},
        url:this.apis.sysUser.getRolesApi
      }
      this.commonUtil.doPost(obj) .then(response=>{
        if (response.code == "200")
        {
          this.pageData.modalForm[5].options = response.responseData;
        }
      });
    },
    //复制报表对话框打开
    copyReport(row){
      this.pageData.copyModalConfig.show = true;
      var obj = {
        url:this.apis.reportTpl.getDetailApi,
        params:{id:row.id},
      }
      this.commonUtil.doGet(obj).then(response=>{
        this.commonUtil.coperyProperties(this.pageData.copyModalData,response.responseData);//数据赋值
        this.pageData.copyModalData.designPwd = "";
        this.pageData.copyModalData.tplCode = "";
        this.pageData.copyModalData.tplName = "";
      });
    },
    closeCopyModal(){
      this.$refs['copyModalRef'].$refs['modalFormRef'].resetFields();//校验重置
      this.pageData.copyModalConfig.show = false;//关闭modal
      this.commonUtil.clearObj(this.pageData.copyModalData);//清空modalData
    },
    //确认复制报表
    doCopy(){
      this.$refs['copyModalRef'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
            var obj = {
              params:this.pageData.copyModalData,
              removeEmpty:false,
            }
            obj.url = this.apis.reportTpl.doCopyReportApi;
            this.commonUtil.doPost(obj) .then(response=>{
              if (response.code == "200")
              {
                this.closeCopyModal();
                this.searchtablelist();
              }
            });
        }else{
            return false;
        }
      });
    },
    getReportTypeTree(){
      var obj = {
        params:{},
        removeEmpty:false,
        url:this.apis.reportType.getReportTypeTreeApi
      }
      this.commonUtil.doPost(obj) .then(response=>{
        if (response.code == "200")
        {
          this.pageData.treeData = response.responseData
        }
      });
    },
    handleNodeClick(data){
      if(data.id == '1')
      {
        this.pageData.queryData.reportType = "";
      }else{
        this.pageData.queryData.reportType = data.id;
      }
      this.searchtablelist();
    },
    changeTplType(){
      if(this.pageData.modalData.tplType == 1)
      {
        this.pageData.modalForm[8].show = false;
        this.pageData.modalForm[8].rules.required = false;
        this.pageData.modalForm[9].show = false;
        this.pageData.modalForm[9].rules.required = false;
        // this.pageData.modalForm[9].show = true;
        // this.pageData.modalForm[9].rules.required = true;
      }else{
        this.pageData.modalForm[8].show = true;
        this.pageData.modalForm[8].rules.required = true;
        this.pageData.modalForm[9].show = true;
        this.pageData.modalForm[9].rules.required = true;
        // this.pageData.modalForm[9].show = false;
        // this.pageData.modalForm[9].rules.required = false;
      }
    },
    showShareReport(row){
      this.pageData.shareReportConfig.show = true;
      this.pageData.shareReportModalData.tplId = row.id;
      this.pageData.shareReportModalData.tplType = row.tplType;
      if(row.tplType == 1)
      {
        this.pageData.shareReportForm[2].show = false;
        this.pageData.shareReportForm[2].rules.required = false;
      }else{
        this.pageData.shareReportForm[2].show = true;
        this.pageData.shareReportForm[2].rules.required = true;
      }
    },
    closeShareReportModal(){
      this.pageData.shareReportConfig.show = false;
      this.commonUtil.clearObj(this.pageData.shareReportModalData);//清空modalData
      this.$refs['shareReport'].$refs['modalFormRef'].resetFields();//校验重置
    },
    getShareUrl(){
      this.$refs['shareReport'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
            if(this.pageData.shareReportModalData.shareType == 2 && this.pageData.shareReportModalData.tplType == 2)
            {
              this.commonUtil.showMessage({message:"填报报表暂时不支持h5分享。",type: this.commonConstants.messageType.error});
              return;
            }
            var obj = {
              params:this.pageData.shareReportModalData,
              removeEmpty:false,
            }
            obj.url = this.apis.reportTpl.getShareUrlApi;
            this.commonUtil.doPost(obj) .then(response=>{
              if (response.code == "200")
              {
                const input = document.getElementById('clipboradInput'); // 承载复制内容
                input.value = response.responseData.shareMsg; // 修改文本框的内容
                input.select(); // 选中文本
                document.execCommand('copy'); // 执行浏览器复制命令
                this.commonUtil.showMessage({message:"分享链接已经添加到剪贴板。",type: this.commonConstants.messageType.success});
                this.closeShareReportModal();
              }
            });
        }else{
            return false;
        }
      });
    },
    isShowShare(row){
      if(row.tplType == 1)
      {
        return true
      }else{
        return false
      }
    },
    routerToTask(row){
      this.$store.commit("setParameters",{key:'taskTplId',value:row.id});
      this.$router.push({ name: 'reportTask'})
    },
  }
};