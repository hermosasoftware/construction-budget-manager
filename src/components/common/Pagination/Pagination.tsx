import ReactPaginate from 'react-paginate';
import { CaretLeft, CaretRight } from 'phosphor-react';
import styles from './Pagination.module.css';

interface IPagination {
  totalCount: number;
  itemsPerPage: number;
  filteredCount: number;
  handleOnPageChange: (currentPage: number, itemsPerPage: number) => void;
  currentPage: number;
}

const Pagination = (props: IPagination) => {
  const {
    totalCount,
    itemsPerPage,
    handleOnPageChange,
    filteredCount,
    currentPage,
  } = props;

  const mainCount = filteredCount === totalCount ? totalCount : filteredCount;
  const pageCount = Math.ceil(mainCount / itemsPerPage);

  const firstPage = currentPage === 0;
  const lastPage = currentPage + 1 === pageCount;
  console.log('currentPage', currentPage);

  const onPageChange = (obj: { selected: number }) => {
    handleOnPageChange(obj.selected, itemsPerPage);
  };

  return (
    <div>
      <ReactPaginate
        containerClassName={styles.pagination_container}
        breakLabel={'...'}
        breakClassName={styles.break_label}
        pageClassName={styles.item_page}
        pageCount={pageCount}
        nextLabel={<CaretRight size={25} />}
        nextClassName={`${styles.page_controller} ${
          lastPage ? styles.disabled : ''
        }`}
        previousLabel={<CaretLeft size={25} />}
        previousClassName={`${styles.page_controller} ${
          firstPage ? styles.disabled : ''
        }`}
        activeClassName={styles.active}
        onPageChange={onPageChange}
        forcePage={currentPage}
      />
    </div>
  );
};

export default Pagination;
