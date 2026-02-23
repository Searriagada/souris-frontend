import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { clienteService } from '../services/entities.service';
import { clienteSchema } from '../schemas';
import { DataTable, Modal, ConfirmDialog, Button, Input, } from '../components/ui';
export function ClientesPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    // Fetch clientes
    const { data: clientes = [], isLoading, error } = useQuery({
        queryKey: ['clientes'],
        queryFn: clienteService.getAll,
    });
    // Form
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(clienteSchema),
    });
    // Mutations
    const createMutation = useMutation({
        mutationFn: clienteService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente creado exitosamente');
            handleCloseModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => clienteService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente actualizado exitosamente');
            handleCloseModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const deleteMutation = useMutation({
        mutationFn: clienteService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente eliminado exitosamente');
            setIsDeleteDialogOpen(false);
            setSelectedCliente(null);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    // Handlers
    const handleOpenCreate = () => {
        setSelectedCliente(null);
        reset({ nombre_cliente: '' });
        setIsModalOpen(true);
    };
    const handleOpenEdit = (cliente) => {
        setSelectedCliente(cliente);
        reset({ nombre_cliente: cliente.nombre_cliente });
        setIsModalOpen(true);
    };
    const handleOpenDelete = (cliente) => {
        setSelectedCliente(cliente);
        setIsDeleteDialogOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
        reset();
    };
    const onSubmit = (data) => {
        if (selectedCliente) {
            updateMutation.mutate({ id: selectedCliente.id_cliente, data });
        }
        else {
            createMutation.mutate(data);
        }
    };
    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    // Table columns
    const columns = [
        {
            key: 'nombre_cliente',
            label: 'Cliente',
            sortable: true,
            render: (item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center", children: _jsx(User, { className: "w-5 h-5 text-amber-500" }) }), _jsx("span", { className: "font-medium text-white", children: item.nombre_cliente })] })),
        },
        {
            key: 'created_at',
            label: 'Registrado',
            sortable: true,
            render: (item) => (_jsx("span", { className: "text-zinc-400", children: formatDate(item.created_at) })),
        },
    ];
    const tableActions = (item) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", title: "Editar", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleOpenDelete(item), className: "p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors", title: "Eliminar", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-serif text-white", children: "Clientes" }), _jsx("p", { className: "text-zinc-500", children: "Gestiona tu base de clientes" })] }), _jsx(Button, { onClick: handleOpenCreate, leftIcon: _jsx(Plus, { className: "w-5 h-5" }), children: "Nuevo Cliente" })] }), _jsx(DataTable, { data: clientes, columns: columns, keyField: "id_cliente", isLoading: isLoading, error: error?.message, searchPlaceholder: "Buscar clientes...", emptyMessage: "No hay clientes registrados", actions: tableActions }), _jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente', size: "sm", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Nombre del cliente", placeholder: "Ej: Juan P\u00E9rez", error: errors.nombre_cliente?.message, ...register('nombre_cliente') }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseModal, className: "flex-1", children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || createMutation.isPending || updateMutation.isPending, className: "flex-1", children: selectedCliente ? 'Guardar cambios' : 'Crear cliente' })] })] }) }), _jsx(ConfirmDialog, { isOpen: isDeleteDialogOpen, onClose: () => setIsDeleteDialogOpen(false), onConfirm: () => selectedCliente && deleteMutation.mutate(selectedCliente.id_cliente), title: "Eliminar Cliente", message: `¿Estás seguro de eliminar a "${selectedCliente?.nombre_cliente}"? Esta acción no se puede deshacer.`, confirmText: "Eliminar", isLoading: deleteMutation.isPending })] }));
}
export default ClientesPage;
