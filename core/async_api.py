import logging
from PySide6.QtCore import QRunnable, QThreadPool, Signal, QObject, Slot


logger = logging.getLogger(__name__)


class AsyncApiSignals(QObject):

    finished = Signal(dict)
    error = Signal(str)


class AsyncApiWorker(QRunnable):

    def __init__(self, fn, *args, **kwargs):
        super().__init__()
        self.fn = fn
        self.args = args
        self.kwargs = kwargs
        self.signals = AsyncApiSignals()

    @Slot()
    def run(self):
        try:
            result = self.fn(*self.args, **self.kwargs)
            self.signals.finished.emit(result)
        except Exception as e:
            logger.exception("Error en llamada API asincrónica")
            self.signals.error.emit(str(e))


_thread_pool = QThreadPool.globalInstance()


def run_async(fn, on_success, on_error, *args, **kwargs):
    worker = AsyncApiWorker(fn, *args, **kwargs)
    worker.signals.finished.connect(on_success)
    if on_error:
        worker.signals.error.connect(on_error)
    _thread_pool.start(worker)
