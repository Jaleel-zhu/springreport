<template>
  <el-config-provider :locale="locale">
    <el-scrollbar height="100vh" ref="scroll">
      <router-view></router-view>
    </el-scrollbar>
  </el-config-provider>
</template>

<script setup>
  import { onMounted, computed, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import apis from './components/common/api';
  import commonUtil from './components/common/common';
  import commonConstants from './components/common/constants';

  import { useRouter } from 'vue-router';
  // import zhCn from 'element-plus/lib/locale/lang/zh-cn';
  import zhCn from 'element-plus/es/locale/lang/zh-cn';

  const store = useStore();

  const scroll = ref(null);

  const router = useRouter();
  onMounted(() => {
    changeBodyWidth();
    window.addEventListener('resize', changeResize);
  });
  const { locale } = reactive({
    locale: zhCn,
  });
  watch(
    () => router.currentRoute.value,
    () => {
      scroll.value.setScrollTop(0);
      let token = router.currentRoute.value.query.token;
      let thirdPartyType = router.currentRoute.value.query.thirdPartyType;
      if(thirdPartyType){
          localStorage.setItem("thirdPartyType", thirdPartyType);
        }else{
          localStorage.removeItem("thirdPartyType")
        }
      if (token && !localStorage.getItem('token')) {
        localStorage.setItem('token', token);
        getUserInfoByToken();
      }
    }
  );

  const changeBodyWidth = () => {
    const flag = document.body.getBoundingClientRect().width - 1 < 992;
    store.dispatch('setting/changeMobile', flag);
  };

  const changeResize = () => {
    changeBodyWidth();
  };
  const getUserInfoByToken = () => {
    var object = {
      url: apis.login.getUserInfoByTokenApi,
      params: {},
      removeEmpty: false,
    };
    commonUtil.doPost(object).then((response) => {
      if (response.code === '200') {
        var responseData = response.responseData;
        localStorage.setItem(commonConstants.sessionItem.userName, responseData.userName);
        localStorage.setItem(commonConstants.sessionItem.roleName, responseData.roleName);
        localStorage.setItem(commonConstants.sessionItem.apiList, responseData.apis); //接口权限，用于判断页面按钮是否显示
        localStorage.setItem(
          commonConstants.sessionItem.isSystemMerchant,
          responseData.isSystemMerchant
        );
        localStorage.setItem(commonConstants.sessionItem.merchantNo, responseData.merchantNo);
        localStorage.setItem(commonConstants.sessionItem.isAdmin, responseData.isAdmin);
      }
    });
  };
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: $base-font-size-default;
    color: #2c3e50;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
