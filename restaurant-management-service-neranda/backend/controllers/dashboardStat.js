router.get('/stats', async (req, res) => {

    const restaurantId = req.user?.id; // depends on your auth setup
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const todayOrders = await Order.countDocuments({ createdAt: { $gte: today }, restaurantId });
      const totalRevenue = await Order.aggregate([
        { $match: { restaurantId: mongoose.Types.ObjectId(restaurantId) } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      const menuCount = await MenuItem.countDocuments({ restaurantId });


      const customerCount = await Order.distinct('customer.email', { restaurantId }).then(arr => arr.length);
      const pendingOrders = await Order.countDocuments({ status: 'pending', restaurantId });
      const completedOrders = await Order.countDocuments({ status: 'delivered', restaurantId });
      const cancelledOrders = await Order.countDocuments({ status: 'cancelled', restaurantId });
  
      const past7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
      });
  
      const revenueByDay = await Promise.all(past7Days.reverse().map(async date => {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
  
        const total = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lt: end }, restaurantId: mongoose.Types.ObjectId(restaurantId) } },
          { $group: { _id: null, sum: { $sum: "$totalAmount" } } }
        ]);
  
        return { date, amount: total[0]?.sum || 0 };
      }));
  
      res.json({
        stats: {
          todayOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          menuCount,
          customerCount,
          pendingOrders,
          completedOrders,
          cancelledOrders
        },
        revenueByDay
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Dashboard stats error' });
    }
});
  