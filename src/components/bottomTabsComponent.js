import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardView from '../views/dashboardView';

const Tab = createBottomTabNavigator();

const Tabs =() => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={DashboardView} />
    </Tab.Navigator>
  );
}

export default Tabs;