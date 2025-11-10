import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; // bạn sẽ tạo cái này ở bước tiếp theo

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
