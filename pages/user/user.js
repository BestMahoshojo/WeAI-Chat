Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      profession: 0,
      hobbies: [],
      aiStyle: 0
    },
    selectedHobbies: [], // 独立的选中状态数组
    hobbySelected: [false, false, false, false, false, false, false, false, false, false], // 布尔值数组
    genderOptions: ['未知', '男', '女'],
    professionOptions: ['学生', '程序员', '设计师', '教师', '医生', '销售', '管理', '其他'],
    hobbyOptions: [
      { key: 'reading', name: '阅读', icon: '📚' },
      { key: 'music', name: '音乐', icon: '🎵' },
      { key: 'sports', name: '运动', icon: '⚽' },
      { key: 'travel', name: '旅行', icon: '✈️' },
      { key: 'cooking', name: '烹饪', icon: '🍳' },
      { key: 'gaming', name: '游戏', icon: '🎮' },
      { key: 'photography', name: '摄影', icon: '📷' },
      { key: 'art', name: '艺术', icon: '🎨' },
      { key: 'technology', name: '科技', icon: '💻' },
      { key: 'nature', name: '自然', icon: '🌿' }
    ],
    aiStyleOptions: ['专业严谨', '友好亲切', '简洁明了', '幽默风趣', '详细深入'],
    isDarkMode: false,
    pageTheme: 'light',
    themeClass: 'theme-light'
  },

  onLoad: function (options) {
    // 加载用户信息
    this.loadUserInfo();
    // 初始化主题
    this.initTheme();
  },

  onShow() {
    // 更新主题状态
    this.updateThemeFromGlobal();
  },

  // 初始化主题
  initTheme() {
    const app = getApp();
    const isDarkMode = app.globalData.isDarkMode;
    this.setData({ 
      isDarkMode,
      pageTheme: isDarkMode ? 'dark' : 'light',
      themeClass: isDarkMode ? 'theme-dark' : 'theme-light'
    });
  },

  // 从全局更新主题
  updateThemeFromGlobal() {
    const app = getApp();
    const isDarkMode = app.globalData.isDarkMode;
    if (this.data.isDarkMode !== isDarkMode) {
      this.setData({ 
        isDarkMode,
        pageTheme: isDarkMode ? 'dark' : 'light',
        themeClass: isDarkMode ? 'theme-dark' : 'theme-light'
      });
    }
  },

  // 主题更新方法（供全局调用）
  updateTheme(isDarkMode) {
    this.setData({ 
      isDarkMode,
      pageTheme: isDarkMode ? 'dark' : 'light',
      themeClass: isDarkMode ? 'theme-dark' : 'theme-light'
    });
  },

  // 加载用户信息
  loadUserInfo: function() {
    const storedUserInfo = wx.getStorageSync('userInfo');
    
    let userInfo = storedUserInfo || {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      profession: 0,
      hobbies: [],
      aiStyle: 0
    };
    
    // 确保hobbies是数组
    if (!Array.isArray(userInfo.hobbies)) {
      userInfo.hobbies = [];
    }
    
    // 初始化布尔值数组
    const hobbySelected = [false, false, false, false, false, false, false, false, false, false];
    userInfo.hobbies.forEach(hobby => {
      const index = this.data.hobbyOptions.findIndex(option => option.key === hobby);
      if (index >= 0) {
        hobbySelected[index] = true;
      }
    });
    
    this.setData({
      userInfo: userInfo,
      selectedHobbies: [...userInfo.hobbies],
      hobbySelected: hobbySelected
    });
  },

  // 选择头像
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        
        // 立即保存头像到本地存储
        const currentUserInfo = this.data.userInfo;
        currentUserInfo.avatarUrl = tempFilePath;
        wx.setStorageSync('userInfo', currentUserInfo);
        
        // 通知主页面更新用户信息
        const pages = getCurrentPages();
        const mainPage = pages.find(page => page.route === 'pages/index/index');
        if (mainPage) {
          mainPage.getUserProfile();
        }
      }
    });
  },

  // 昵称输入
  onNickNameInput: function(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  // 性别选择
  onGenderChange: function(e) {
    this.setData({
      'userInfo.gender': parseInt(e.detail.value)
    });
  },

  // 职业选择
  onProfessionChange: function(e) {
    this.setData({
      'userInfo.profession': parseInt(e.detail.value)
    });
  },

  // 切换兴趣爱好
  toggleHobby: function(e) {
    const hobbyKey = e.currentTarget.dataset.hobby;
    const index = this.data.hobbyOptions.findIndex(option => option.key === hobbyKey);
    
    if (index === -1) {
      return;
    }
    
    // 复制布尔值数组
    const hobbySelected = [...this.data.hobbySelected];
    hobbySelected[index] = !hobbySelected[index];
    
    // 更新selectedHobbies数组
    const selectedHobbies = [];
    hobbySelected.forEach((selected, i) => {
      if (selected) {
        selectedHobbies.push(this.data.hobbyOptions[i].key);
      }
    });
    
    // 更新数据
    this.setData({
      hobbySelected: hobbySelected,
      selectedHobbies: selectedHobbies,
      'userInfo.hobbies': selectedHobbies
    });
  },

  // 回答风格选择
  onAiStyleChange: function(e) {
    this.setData({
      'userInfo.aiStyle': parseInt(e.detail.value)
    });
  },

  // 保存用户信息
  saveUserInfo: function() {
    const userInfo = this.data.userInfo;
    
    // 验证昵称（昵称可以为空，但建议填写）
    if (!userInfo.nickName.trim()) {
      wx.showModal({
        title: '昵称为空',
        content: '昵称为空，是否继续保存？',
        success: (res) => {
          if (res.confirm) {
            this.saveUserInfoToStorage(userInfo);
          }
        }
      });
      return;
    }

    // 直接保存
    this.saveUserInfoToStorage(userInfo);
  },

  // 保存用户信息到存储
  saveUserInfoToStorage: function(userInfo) {
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
    
    // 通知主页面更新用户信息
    const pages = getCurrentPages();
    const mainPage = pages.find(page => page.route === 'pages/index/index');
    if (mainPage) {
      mainPage.getUserProfile();
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 重置用户信息
  resetUserInfo: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有用户信息吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultUserInfo = {
            avatarUrl: '',
            nickName: '',
            gender: 0,
            profession: 0,
            hobbies: [],
            aiStyle: 0
          };
          this.setData({
            userInfo: defaultUserInfo
          });
          wx.setStorageSync('userInfo', defaultUserInfo);
          
          // 通知主页面更新用户信息
          const pages = getCurrentPages();
          const mainPage = pages.find(page => page.route === 'pages/index/index');
          if (mainPage) {
            mainPage.getUserProfile();
          }
          
          wx.showToast({
            title: '重置成功',
            icon: 'success'
          });
        }
      }
    });
  }
}); 