import "./Pagination.css";

const Pagination = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
}) => {
    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / pageSize)
    );

    const firstItem =
        totalItems === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const lastItem = Math.min(
        currentPage * pageSize,
        totalItems
    );

    const getVisiblePages = () => {
        const pages = [];

        const start = Math.max(
            1,
            currentPage - 2
        );

        const end = Math.min(
            totalPages,
            currentPage + 2
        );

        for (
            let page = start;
            page <= end;
            page++
        ) {
            pages.push(page);
        }

        return pages;
    };

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Showing{" "}
                <strong>{firstItem}</strong>
                {" - "}
                <strong>{lastItem}</strong>
                {" of "}
                <strong>{totalItems}</strong>
            </div>

            <div className="pagination-controls">
                <select
                    className="pagination-size"
                    value={pageSize}
                    onChange={(event) =>
                        onPageSizeChange(
                            Number(
                                event.target.value
                            )
                        )
                    }
                >
                    <option value={10}>
                        10 / page
                    </option>

                    <option value={25}>
                        25 / page
                    </option>

                    <option value={50}>
                        50 / page
                    </option>
                </select>

                <button
                    type="button"
                    className="pagination-button"
                    disabled={
                        currentPage === 1
                    }
                    onClick={() =>
                        onPageChange(
                            currentPage - 1
                        )
                    }
                >
                    Previous
                </button>

                {getVisiblePages().map(
                    (page) => (
                        <button
                            key={page}
                            type="button"
                            className={
                                page ===
                                    currentPage
                                    ? "pagination-button pagination-button-active"
                                    : "pagination-button"
                            }
                            onClick={() =>
                                onPageChange(
                                    page
                                )
                            }
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    type="button"
                    className="pagination-button"
                    disabled={
                        currentPage >=
                        totalPages
                    }
                    onClick={() =>
                        onPageChange(
                            currentPage + 1
                        )
                    }
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;