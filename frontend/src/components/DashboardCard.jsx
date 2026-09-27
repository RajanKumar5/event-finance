const DashboardCard = ({ title, value }) => {
    return (
        <div className="dashboard-card">
            <p className="dashboard-card-title">{title}</p>
            <h3 className="dashboard-card-value">{value}</h3>
        </div>
    );
};

export default DashboardCard;