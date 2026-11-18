"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, CircleCheck, Search, Users } from "lucide-react";
import { toast } from "sonner";
import type { PizzaUser } from "@/types";
import { getAdminUsers, setUserBlocked } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InlineLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { debounce, formatDate } from "@/lib/utils";

const roleMeta: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-gold/15 text-gold border-gold/40",
  },
  vendor: {
    label: "Vendor",
    className: "bg-forest text-gold-light border-forest",
  },
  customer: {
    label: "Customer",
    className: "bg-muted text-muted-foreground border-border",
  },
};

/** Admin — Manage Users: search, filter, block/unblock. */
export function AdminUsersView() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [users, setUsers] = useState<PizzaUser[] | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PizzaUser | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    (q: string, r: string) => {
      setUsers(null);
      getAdminUsers({
        search: q || undefined,
        role: r !== "all" ? r : undefined,
      })
        .then(setUsers)
        .catch((err: unknown) => {
          setUsers([]);
          toast.error("Could not load users", {
            description: err instanceof Error ? err.message : "Try again.",
          });
        });
    },
    [],
  );

  const debouncedLoad = useCallback(
    debounce((q: string, r: string) => load(q, r), 350),
    [load],
  );

  useEffect(() => {
    debouncedLoad(search, role);
  }, [search, role, debouncedLoad]);

  const toggleBlock = async () => {
    if (!confirmTarget) return;
    setBusy(true);
    try {
      const updated = await setUserBlocked(
        confirmTarget.id,
        !confirmTarget.isBlocked,
      );
      setUsers(
        (prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? null,
      );
      toast.success(
        updated.isBlocked ? "User blocked" : "User unblocked",
        {
          description: `${updated.name} can${updated.isBlocked ? " no longer" : " now"} access protected features.`,
        },
      );
      setConfirmTarget(null);
    } catch (err: unknown) {
      toast.error("Action failed", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Manage Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter and moderate every registered account. Blocked users
          lose access to protected features.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 rounded-full pl-10"
            aria-label="Search users"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-10 rounded-full sm:w-44" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users === null ? (
        <InlineLoader className="py-16" />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try a different search term or role filter."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const meta = roleMeta[user.role];
                const isSelfAdmin = user.role === "admin";
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-gold/30">
                          {user.image ? (
                            <AvatarImage src={user.image} alt={user.name} />
                          ) : null}
                          <AvatarFallback className="bg-gradient-to-br from-gold to-[#a8801f] text-xs font-bold text-forest-deep">
                            {user.name
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-sm font-semibold">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${meta.className}`}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isBlocked
                            ? "border-red-300 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                            : "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                        }
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelfAdmin ? (
                        <span className="text-xs text-muted-foreground">
                          Protected
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmTarget(user)}
                          className={
                            user.isBlocked
                              ? "rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                              : "rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                          }
                        >
                          {user.isBlocked ? (
                            <>
                              <CircleCheck className="size-3.5" /> Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="size-3.5" /> Block
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(v) => !v && setConfirmTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              {confirmTarget?.isBlocked ? "Unblock" : "Block"}{" "}
              {confirmTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget?.isBlocked
                ? "They will regain access to all protected platform features."
                : "They will immediately lose access to protected features such as dashboards and ordering."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={toggleBlock}
              disabled={busy}
              className={
                confirmTarget?.isBlocked
                  ? "rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                  : "rounded-full bg-destructive text-white hover:bg-destructive/90"
              }
            >
              {busy ? "Working…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
