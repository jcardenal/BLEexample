class Mock:
    def __init__(self):
        self._calls_matching = {}
        self._actual_calls = []

    def when(self, method_name, required_args=None, return_value=None):
        if method_name not in self._calls_matching.keys():
            self._calls_matching[method_name] = {'params': [], 'return_values': []}
        self._calls_matching[method_name]['params'].append(required_args)
        self._calls_matching[method_name]['return_values'].append(return_value)

    def has_been_called(self, times=1):
        if self._actual_calls and len(self._actual_calls) == times:
            return True
        return False

    def reset(self):
        self._actual_calls = []
        self._calls_matching = {}

    def _wrapper(self, method_name):
        def func(*args, **kwargs):
            self._actual_calls.append(method_name)
            if method_name in self._calls_matching.keys():
                if args:
                    return self._get_return_value(method_name, args)
                elif kwargs:
                    return self._get_return_value(method_name, kwargs)
                else:
                    return self._get_return_value(method_name, None)
            return None
        return func


    def _get_return_value(self, method_name, parameters):
        if parameters in self._calls_matching[method_name]['params']:
            index = self._calls_matching[method_name]['params'].index(parameters)
            return self._calls_matching[method_name]['return_values'][index]
        elif None in self._calls_matching[method_name]['params']:
            index = self._calls_matching[method_name]['params'].index(None)
            return self._calls_matching[method_name]['return_values'][index]


def createMock(cls = None):
    newMock = Mock()
    if cls is not None:
        for attr in dir(cls):
            if callable(getattr(cls, attr)):
                setattr(newMock, attr, newMock._wrapper(attr))
    return newMock
